const { validationResult } = require('express-validator');
const Shipping = require('../models/Shipping');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/Product');

// Get all shipping methods (admin only)
exports.getAllShippingMethods = async (req, res) => {
    try {
        const shippingMethods = await Shipping.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: { shippingMethods } 
        });
    } catch (error) {
        console.error('Get all shipping methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get active shipping methods
exports.getActiveShippingMethods = async (req, res) => {
    try {
        const shippingMethods = await Shipping.find({ isActive: true })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            shippingMethods
        });
    } catch (error) {
        console.error('Get active shipping methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create shipping method (admin only)
exports.createShippingMethod = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const shippingMethod = new Shipping(req.body);
        await shippingMethod.save();

        res.status(201).json({
            success: true,
            shippingMethod
        });
    } catch (error) {
        console.error('Create shipping method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update shipping method (admin only)
exports.updateShippingMethod = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const shippingMethod = await Shipping.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!shippingMethod) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }

        res.json({
            success: true,
            shippingMethod
        });
    } catch (error) {
        console.error('Update shipping method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete shipping method (admin only)
exports.deleteShippingMethod = async (req, res) => {
    try {
        const shippingMethod = await Shipping.findByIdAndDelete(req.params.id);

        if (!shippingMethod) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }

        res.json({
            success: true,
            message: 'Shipping method deleted successfully'
        });
    } catch (error) {
        console.error('Delete shipping method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get shipping methods
exports.getShippingMethods = async (req, res, next) => {
    const shippingMethods = await Shipping.find({ isCreated : -1 })
        .select('name description baseCost estimatedDays isActive');

    res.status(200).json({
        status: 'success',
        data: {
            shippingMethods
        }
    });
};

// Calculate shipping cost
exports.calculateShippingCost = async (req, res, next) => {
    const { shippingMethodId, address, items } = req.body;

    // Get shipping method
    const shippingMethod = await Shipping.findById(shippingMethodId);
    if (!shippingMethod) {
        return next(new AppError('Shipping method not found', 404));
    }

    // Calculate total weight and dimensions
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return next(new AppError(`Product ${item.productId} not found`, 404));
        }

        totalWeight += product.weight * item.quantity;
        maxLength = Math.max(maxLength, product.length);
        maxWidth = Math.max(maxWidth, product.width);
        maxHeight = Math.max(maxHeight, product.height);
    }

    // Calculate distance (placeholder)
    const distance = await calculateDistance(address);

    // Calculate shipping cost based on:
    // 1. Base cost
    // 2. Weight
    // 3. Distance
    // 4. Package dimensions
    const shippingCost = await calculateShippingRate(
        shippingMethod,
        totalWeight,
        distance,
        { length: maxLength, width: maxWidth, height: maxHeight }
    );

    res.status(200).json({
        status: 'success',
        data: {
            shippingCost,
            estimatedDays: shippingMethod.estimatedDays
        }
    });
};

// Get shipping tracking
exports.getShippingTracking = async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    }).select('status trackingNumber shippingUpdates');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    if (!order.trackingNumber) {
        return next(new AppError('Order has no tracking number', 400));
    }

    // TODO: Integrate with actual shipping provider API
    // This is a placeholder for tracking information
    const trackingInfo = {
        status: order.status,
        trackingNumber: order.trackingNumber,
        updates: order.shippingUpdates || []
    };

    res.status(200).json({
        status: 'success',
        data: {
            tracking: trackingInfo
        }
    });
};

// Update shipping status (admin only)
exports.updateShippingStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status, location, description, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Optional: initialize array if undefined
    if (!order.shippingUpdates) order.shippingUpdates = [];

    order.shippingUpdates.push({
        status,
        location,
        description,
        timestamp: new Date()
    });

    // Update tracking number if sent
    if (trackingNumber) {
        order.trackingNumber = trackingNumber;
    }

    // ✅ Use the model method to update status
    await order.updateStatus(status);

    res.status(200).json({
        status: 'success',
        data: { order }
    });
};

const handleEdit = method => {
  setEditId(method._id);
  setForm({
    name: method.name || '',
    description: method.description || '',
    baseCost: method.baseCost !== undefined ? String(method.baseCost) : '',
    estimatedDaysMin: method.estimatedDays?.min !== undefined ? String(method.estimatedDays.min) : '',
    estimatedDaysMax: method.estimatedDays?.max !== undefined ? String(method.estimatedDays.max) : '',
    isActive: !!method.isActive,
    weightLimit: method.weightLimit !== undefined ? String(method.weightLimit) : '',
    dimensionsLength: method.dimensions?.length !== undefined ? String(method.dimensions.length) : '',
    dimensionsWidth: method.dimensions?.width !== undefined ? String(method.dimensions.width) : '',
    dimensionsHeight: method.dimensions?.height !== undefined ? String(method.dimensions.height) : '',
    handlingFee: method.handlingFee !== undefined ? String(method.handlingFee) : '',
    freeShippingThreshold: method.freeShippingThreshold !== undefined ? String(method.freeShippingThreshold) : '',
    regions: (method.regions || [{ country: '', states: '' }]).map(r => ({
      country: r.country || '',
      // Convert array to comma-separated string if needed
      states: Array.isArray(r.states) ? r.states.join(', ') : (r.states || ''),
    })),
    priceRules: method.priceRules || [{ minWeight: '', maxWeight: '', price: '' }],
  });
};
