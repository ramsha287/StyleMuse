const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Shipping = require('../models/Shipping');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Helper function to calculate shipping cost
const calculateShippingCost = async (address, items) => {
    // TODO: Implement actual shipping cost calculation
    // This should:
    // 1. Calculate total weight and dimensions
    // 2. Calculate distance from warehouse
    // 3. Apply shipping rates
    return 5.00; // Placeholder
};

// Helper function to generate order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

// Get all orders (admin only)
const getAllOrders = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'name email')
        .populate('items.product', 'name');

    const total = await Order.countDocuments(query);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        },
        data: {
            orders
        }
    });
});

// Get user orders
const getUserOrders = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) {
        query.status = status;
    }

    const orders = await Order.find(query)
        .populate('items.product', 'name images')
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Order.countDocuments(query);

    res.status(200).json({
        status: 'success',
        data: {
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }
    });
});

// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'name email')
            .populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user.userId && req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create an order
const createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'price stock');
    
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty', 400));
    }

    // Check stock availability
    for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
            return next(new AppError(`Insufficient stock for ${item.product.name}`, 400));
        }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0);

    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(shippingAddress, cart.items);

    // Calculate tax (10%)
    const tax = (subtotal) * 0.1;

    // Calculate total
    const total = subtotal + tax + shippingCost;

    // Create order
    const defaultShipping = await Shipping.findOne(); // No filter, just get the first one
    
    if (!defaultShipping) {
        return next(new AppError('No shipping method found', 500));
    }

    const order = await Order.create({
        user: req.user._id,
        items: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        })),
        shippingAddress,
        paymentMethod,
        shippingMethod: defaultShipping._id,
        shippingCost: defaultShipping.baseCost,
        subtotal,
        tax,
        total,
        orderStatus: 'pending',
        orderNumber: generateOrderNumber()
    });

    // Update product stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order details
    await order.populate('items.product', 'name images');

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

// Get order details
const getOrderDetails = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    }).populate('items.product', 'name images');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// Update order status (admin only)
const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    await order.updateStatus(status); 

    res.status(200).json({
        status: 'success',
        message: 'Order status updated',
        data: { order }
    });
};

// Cancel an order
const cancelOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // If not admin, only allow cancelling own order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to cancel this order', 403));
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.orderStatus)) {
        return next(new AppError('Order cannot be cancelled', 400));
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();

    // Restore product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
        });
    }

    await order.save();

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

//Add tracking number to order

const addTrackingNumber = async(req, res, next) => {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        order.trackingNumber = trackingNumber;
        await order.save();

        res.status(200).json({
            status: 'success',
            message: 'Tracking number updated successfully',
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber
            }
        });
    } catch (err) {
        next(err);
    }
};


// Track order status
const trackOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .select('status trackingNumber createdAt shippedAt deliveredAt completedAt cancelledAt')
        .populate('items.product', 'name');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Check if user has access to this order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to track this order', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

const returnOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        // Only allow return if delivered and not already returned/cancelled
        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({ status: 'fail', message: 'Only delivered orders can be returned' });
        }
        if (order.orderStatus === 'returned') {
            return res.status(400).json({ status: 'fail', message: 'Order already returned' });
        }

        order.orderStatus = 'returned';
        order.shippingUpdates.push({
            status: 'returned',
            description: `Order returned at ${new Date().toLocaleString()}`,
            location: 'Return Center'
        });
        await order.save();

        res.status(200).json({
            status: 'success',
            message: 'Order marked as returned',
            data: { order }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllOrders,
    getUserOrders,
    getOrder,
    createOrder,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    trackOrder,
    addTrackingNumber,
    calculateShippingCost,
    generateOrderNumber,
    returnOrder
};
