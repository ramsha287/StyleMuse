const Coupon = require('../models/Coupon');
const { validationResult } = require('express-validator');

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Get all coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get active coupons
exports.getActiveCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Get active coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const coupon = new Coupon(req.body);
        await coupon.save();

        res.status(201).json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const currentDate = new Date();

        const coupon = await Coupon.findOne({
            code,
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code'
            });
        }

        // Check if coupon has been used maximum times
        if (coupon.usageCount >= coupon.maxUsage) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has reached maximum usage limit'
            });
        }

        // Check if user has already used this coupon
        if (coupon.usedBy.includes(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already used this coupon'
            });
        }

        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};