const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { userValidationRules, validateRequest } = require('../middlewares/validationMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount
} = require('../controllers/authController');

// Public routes
router.post('/register', userValidationRules.register, validateRequest, asyncHandler(register));
router.post('/login', userValidationRules.login, validateRequest, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', userValidationRules.forgotPassword, validateRequest, asyncHandler(forgotPassword));
router.patch('/reset-password/:token', userValidationRules.resetPassword, validateRequest, asyncHandler(resetPassword));
router.patch('/change-password', protect, asyncHandler(changePassword));

// Protected routes
router.get('/me', protect, asyncHandler(getCurrentUser));
router.patch('/profile', protect, asyncHandler(updateProfile));
router.delete('/delete-account', protect, asyncHandler(deleteAccount));

module.exports = router;
