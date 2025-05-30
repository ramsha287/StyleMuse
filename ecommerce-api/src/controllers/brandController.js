const Brand = require('../models/Brand');
const { validationResult } = require('express-validator');

// Get all brands
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json({
            success: true,
            brands
        });
    } catch (error) {
        console.error('Get all brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get single brand
exports.getBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        res.json({
            success: true,
            brand
        });
    } catch (error) {
        console.error('Get brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create brand (admin only)
exports.createBrand = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const brand = new Brand(req.body);
        await brand.save();

        res.status(201).json({
            success: true,
            brand
        });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update brand (admin only)
exports.updateBrand = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            brand
        });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete brand (admin only)
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};