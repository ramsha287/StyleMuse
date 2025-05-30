const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { AppError } = require('./errorMiddleware');

// Protect routes
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            logger.error('No token provided in request');
            throw new AppError('Not authorized to access this route', 401);
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger.info(`Token verified for user ID: ${decoded.id}`);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                logger.error(`User not found for ID: ${decoded.id}`);
                throw new AppError('User not found', 401);
            }

            // Check if user is active
            if (!user.isActive) {
                logger.error(`User account is deactivated: ${decoded.id}`);
                throw new AppError('User account is deactivated', 401);
            }

            // Attach user to request
            // Attach user to request
            console.log('User retrieved and set in req.user:', user); // Log user object
            req.user = user;
            next();
        } catch (error) {
            logger.error('Token verification failed:', error);
            if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid token', 401);
            }
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token expired', 401);
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'User role is not defined or user is not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            logger.error(`Unauthorized access attempt by user ${req.user._id} with role ${req.user.role}`);
            throw new AppError(`User role ${req.user.role} is not authorized to access this route`, 403);
        }

        next();
    };
};


// Admin middleware
const admin = authorize('admin');

// Auth middleware (alias for protect)
const auth = protect;

module.exports = {
    protect,
    authorize,
    admin,
    auth
};