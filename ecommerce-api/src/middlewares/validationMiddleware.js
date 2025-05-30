const { body, query, param, validationResult ,check} = require('express-validator');
const AppError = require('../utils/appError');
const { create } = require('../models/Payment');


// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Helper function to create validation middleware
const createValidationMiddleware = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    };
};

// Export validateRequest and createValidationMiddleware
exports.validateRequest = validateRequest;
exports.createValidationMiddleware = createValidationMiddleware;

// User validation rules
exports.userValidationRules = {
    register: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    login: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
    ],
    updateProfile: [
        body('name')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('address')
            .optional()
            .isObject()
            .withMessage('Address must be an object')
    ],
    updateRole: [
        body('role')
            .isIn(['user', 'seller', 'admin'])
            .withMessage('Invalid role')
    ],
    resetPassword: [
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[!@#$%^&*]/)
            .withMessage('Password must contain at least one special character')
    ],
    forgotPassword: [
        body('email').isEmail().withMessage('Please enter a valid email')
    ],
    changePassword: [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ],
    address: [
        body('street').notEmpty().withMessage('Street is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('zipCode').notEmpty().withMessage('Zip code is required'),
        body('country').notEmpty().withMessage('Country is required'),
        body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
    ]
};

// Product validation rules
exports.productValidationRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Product name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Product name must be between 2 and 100 characters'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Product description is required')
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters long'),
        body('price')
            .notEmpty()
            .withMessage('Price is required')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('category')
            .notEmpty()
            .withMessage('Category is required')
            .isMongoId()
            .withMessage('Invalid category ID'),
        body('brand')
            .optional()
            .isMongoId()
            .withMessage('Invalid brand ID'),
        body('stock')
            .notEmpty()
            .withMessage('Stock is required')
            .isInt({ min: 0 })
            .withMessage('Stock must be a positive integer'),
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array')
    ],
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Product name must be between 2 and 100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters long'),
        body('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('category')
            .optional()
            .isMongoId()
            .withMessage('Invalid category ID'),
        body('brand')
            .optional()
            .isMongoId()
            .withMessage('Invalid brand ID'),
        body('stock')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Stock must be a positive integer'),
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array')
    ]
};

// Order validation rules
exports.orderValidationRules = {
    create: [
        body('items')
            .isArray()
            .withMessage('Items must be an array')
            .notEmpty()
            .withMessage('Order must contain at least one item'),
        body('items.*.product')
            .isMongoId()
            .withMessage('Invalid product ID'),
        body('items.*.quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),
        body('shippingAddress')
            .isObject()
            .withMessage('Shipping address is required'),
        body('shippingAddress.street')
            .trim()
            .notEmpty()
            .withMessage('Street address is required'),
        body('shippingAddress.city')
            .trim()
            .notEmpty()
            .withMessage('City is required'),
        body('shippingAddress.state')
            .trim()
            .notEmpty()
            .withMessage('State is required'),
        body('shippingAddress.zipCode')
            .trim()
            .notEmpty()
            .withMessage('ZIP code is required'),
        body('shippingAddress.country')
            .trim()
            .notEmpty()
            .withMessage('Country is required'),
        body('paymentMethod')
            .trim()
            .notEmpty()
            .withMessage('Payment method is required')
    ]
};

// Review validation rules
exports.validateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Comment must be between 10 and 1000 characters'),
    body('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array')
        .custom((value) => {
            if (value && value.length > 5) {
                throw new Error('Maximum 5 images allowed');
            }
            return true;
        })
];

exports.validateReviewReaction = [
    body('action')
        .isIn(['like', 'dislike'])
        .withMessage('Invalid action. Must be either "like" or "dislike"')
];

exports.validateReviewReport = [
    body('reason')
        .isIn(['spam', 'inappropriate', 'fake', 'other'])
        .withMessage('Invalid report reason')
];

// Coupon validation rules
exports.couponValidationRules = {
    create: [
        body('code')
            .trim()
            .notEmpty()
            .withMessage('Coupon code is required')
            .isLength({ min: 3, max: 20 })
            .withMessage('Coupon code must be between 3 and 20 characters'),
        body('discount')
            .notEmpty()
            .withMessage('Discount is required')
            .isFloat({ min: 0, max: 100 })
            .withMessage('Discount must be between 0 and 100'),
        body('startDate')
            .notEmpty()
            .withMessage('Start date is required')
            .isISO8601()
            .withMessage('Invalid start date format'),
        body('endDate')
            .notEmpty()
            .withMessage('End date is required')
            .isISO8601()
            .withMessage('Invalid end date format')
            .custom((endDate, { req }) => {
                if (new Date(endDate) <= new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }),
        body('maxUsage')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Maximum usage must be at least 1')
    ]
};

// Cart validation rules
exports.validateCartItem = [
    body('productId')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
];

exports.validateCartUpdate = [
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
];

// Wishlist validation rules
exports.validateWishlistItem = [
    body('productId')
        .isMongoId()
        .withMessage('Invalid product ID')
];

// Shipping validation rules
exports.validateShippingAddress = [
    body('address.street')
        .trim()
        .notEmpty()
        .withMessage('Street address is required'),
    body('address.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('address.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('address.zipCode')
        .trim()
        .notEmpty()
        .withMessage('ZIP code is required'),
    body('address.country')
        .trim()
        .notEmpty()
        .withMessage('Country is required')
];

exports.validateShippingStatus = [
    body('status')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'failed'])
        .withMessage('Invalid shipping status'),
    body('location')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Location cannot be empty'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

exports.validateShippingCalculation = [
    body('shippingMethodId')
        .isMongoId()
        .withMessage('Invalid shipping method ID'),
    body('address')
        .isObject()
        .withMessage('Shipping address is required'),
    body('items')
        .isArray()
        .withMessage('Items must be an array')
        .notEmpty()
        .withMessage('At least one item is required'),
    body('items.*.productId')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
];

// Order validation rules
exports.validateOrder = [
    body('shippingAddress')
        .isObject()
        .withMessage('Shipping address is required'),
    body('shippingAddress.street')
        .trim()
        .notEmpty()
        .withMessage('Street address is required'),
    body('shippingAddress.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('shippingAddress.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.zipCode')
        .trim()
        .notEmpty()
        .withMessage('ZIP code is required'),
    body('shippingAddress.country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer','gpay','paytm'])
        .withMessage('Invalid payment method'),
    body('couponCode')
        .optional()
        .trim()
        .isString()
        .withMessage('Coupon code must be a string')
];

exports.validateOrderStatus = [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed', 'returned', 'refunded'])
        .withMessage('Invalid order status')
];

// Payment validation rules
exports.validatePayment = [
    body('orderId')
        .isMongoId()
        .withMessage('Invalid order ID'),
    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer','gpay','paytm'])
        .withMessage('Invalid payment method'),
    body('currency') // Optional field
        .optional()
        .isString()
        .withMessage('Currency must be a string')
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-letter code'),
    body('paymentDetails')
        .optional()
        .isObject()
        .withMessage('Payment details must be an object'),
    body('paymentDetails.cardNumber')
        .optional()
        .matches(/^[0-9]{16}$/)
        .withMessage('Invalid card number'),
    body('paymentDetails.expiryMonth')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Invalid expiry month'),
    body('paymentDetails.expiryYear')
        .optional()
        .isInt({ min: new Date().getFullYear() })
        .withMessage('Invalid expiry year'),
    body('paymentDetails.cvv')
        .optional()
        .matches(/^[0-9]{3,4}$/)
        .withMessage('Invalid CVV'),
    body('paymentDetails.paypalEmail')
        .optional()
        .isEmail()
        .withMessage('Invalid PayPal email'),
    body('paymentDetails.bankAccount')
        .optional()
        .isString()
        .withMessage('Bank account must be a string')
];

// Refund validation rules
exports.validateRefund = [
    param('transactionId')
        .trim()
        .notEmpty()
        .withMessage('Transaction ID is required'),
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    body('reason')
        .trim()
        .notEmpty()
        .withMessage('Refund reason is required')
        .isIn(['customer_request', 'product_return', 'fraud', 'other'])
        .withMessage('Invalid refund reason'),
    body('refundMethod')
        .trim()
        .notEmpty()
        .withMessage('Refund method is required')
        .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer','gpay','paytm'])
        .withMessage('Invalid refund method'),
    body('bankDetails')
        .optional()
        .isObject()
        .withMessage('Bank details must be an object')
        .custom((value, { req }) => {
            if (req.body.refundMethod === 'bank_transfer' && !value) {
                throw new Error('Bank details are required for bank transfer refunds');
            }
            return true;
        }),
    body('bankDetails.accountNumber')
        .optional()
        .isString()
        .withMessage('Account number must be a string'),
    body('bankDetails.routingNumber')
        .optional()
        .isString()
        .withMessage('Routing number must be a string'),
    body('bankDetails.accountType')
        .optional()
        .isIn(['checking', 'savings'])
        .withMessage('Invalid account type'),
    body('bankDetails.accountHolderName')
        .optional()
        .isString()
        .withMessage('Account holder name must be a string'),
    body('bankDetails.bankName')
        .optional()
        .isString()
        .withMessage('Bank name must be a string')
];

exports.validateShippingMethod = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Shipping method name is required'),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),

    body('baseCost')
        .notEmpty()
        .withMessage('Base cost is required')
        .isFloat({ min: 0 })
        .withMessage('Base cost must be a positive number'),

    body('estimatedDays.min')
        .isInt({ min: 1 })
        .withMessage('Minimum estimated days must be an integer of at least 1'),

    body('estimatedDays.max')
        .isInt({ min: 1 })
        .withMessage('Maximum estimated days must be an integer of at least 1'),
    
  
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];