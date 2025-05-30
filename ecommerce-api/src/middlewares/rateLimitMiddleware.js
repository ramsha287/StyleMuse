const rateLimit = require('express-rate-limit');

// Create a limiter for general API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Create a stricter limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Create a limiter for search endpoints
const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        success: false,
        message: 'Too many search requests from this IP, please try again after a minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Create a limiter for checkout endpoints
const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many checkout attempts from this IP, please try again after a minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Create a limiter for review submission
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 review submissions per windowMs
    message: {
        success: false,
        message: 'Too many review submissions from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    searchLimiter,
    checkoutLimiter,
    reviewLimiter
};