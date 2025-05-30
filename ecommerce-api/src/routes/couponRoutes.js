const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middlewares/authMiddleware');
const { couponValidationRules, validateRequest } = require('../middlewares/validationMiddleware');
const {
    getAllCoupons,
    getActiveCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    applyCoupon
} = require('../controllers/couponController');

// Public routes
router.get('/active', getActiveCoupons);

// Protected routes (admin only)
router.get('/admin', auth, admin, getAllCoupons);
router.post('/admin', auth, admin, couponValidationRules.create, validateRequest, createCoupon);
router.put('/admin/:id', auth, admin, validateRequest, updateCoupon);
router.delete('/admin/:id', auth, admin, deleteCoupon);

// Protected routes (authenticated users)
router.post('/apply', auth, validateRequest, applyCoupon);

module.exports = router;