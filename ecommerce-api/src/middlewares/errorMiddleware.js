const logger = require('../utils/logger');

// Error response handler
const errorResponse = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    logger.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new Error(message);
        return res.status(404).json({
            success: false,
            error: message
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        return res.status(400).json({
            success: false,
            error: message
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new Error(message);
        return res.status(400).json({
            success: false,
            error: message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        return res.status(401).json({
            success: false,
            error: message
        });
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        return res.status(401).json({
            success: false,
            error: message
        });
    }

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size is too large. Max limit is 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files uploaded. Max limit is 5 files'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Express validator errors
    if (err.name === 'ValidationError' && Array.isArray(err.errors)) {
        return res.status(400).json({
            success: false,
            error: err.errors.map(e => e.msg)
        });
    }

    // Custom error with status code
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

// Not found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// Async handler to avoid try-catch blocks
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log detailed error information
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: {
                name: err.name,
                message: err.message,
                stack: err.stack,
                statusCode: err.statusCode
            },
            request: {
                path: req.path,
                method: req.method,
                body: req.body,
                query: req.query,
                params: req.params
            }
        });
    } else {
        // Production mode
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown errors
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
};

module.exports = {
    errorResponse,
    notFound,
    asyncHandler,
    AppError,
    errorHandler
};