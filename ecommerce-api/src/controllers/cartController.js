const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get cart
const getCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price stock images');

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // Calculate and update totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;
    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

// Add item to cart
const addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Insufficient stock', 400));
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        // Update quantity if product exists
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
            return next(new AppError('Insufficient stock', 400));
        }
        existingItem.quantity = newQuantity;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }

    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price stock images');

    // Calculate and update totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

// Update cart item quantity
const updateCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        return next(new AppError('Item not found in cart', 404));
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Insufficient stock', 400));
    }

    item.quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price stock images');

    // Calculate and update totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

// Remove item from cart
const removeFromCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
        item => item.product.toString() !== productId
    );

    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price stock images');

    // Calculate and update totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

// Clear cart
const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.items = [];

    // Calculate and update totals
    const { subtotal, tax, total } = calculateCartTotals(cart.items);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

// Apply coupon to cart
const applyCoupon = catchAsync(async (req, res, next) => {
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'price');
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // TODO: Implement coupon validation and application
    // This should:
    // 1. Validate coupon code
    // 2. Check if coupon is valid for cart items
    // 3. Calculate discount
    // 4. Update cart with discount

    res.status(200).json({
        status: 'success',
        message: 'Coupon applied successfully'
    });
});

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
        subtotal,
        tax,
        total
    };
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    calculateCartTotals
};
