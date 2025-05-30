/**
 * Wraps an async route handler to catch and forward errors to the error handling middleware
 * @param {Function} fn - The async route handler function
 * @returns {Function} Wrapped route handler that catches errors
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Wraps multiple async route handlers to catch and forward errors
 * @param {Array<Function>} handlers - Array of async route handler functions
 * @returns {Array<Function>} Array of wrapped route handlers that catch errors
 */
const catchAsyncMultiple = (handlers) => {
    return handlers.map(handler => catchAsync(handler));
};

/**
 * Wraps an async route handler to catch and forward errors with custom error handling
 * @param {Function} fn - The async route handler function
 * @param {Function} errorHandler - Custom error handling function
 * @returns {Function} Wrapped route handler that catches errors
 */
const catchAsyncWithCustomHandler = (fn, errorHandler) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(error => {
                if (errorHandler) {
                    return errorHandler(error, req, res, next);
                }
                next(error);
            });
    };
};

module.exports = {
    catchAsync,
    catchAsyncMultiple,
    catchAsyncWithCustomHandler
}; 