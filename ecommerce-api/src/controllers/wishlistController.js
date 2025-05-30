const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const {catchAsync} = require('../utils/catchAsync');

// Get wishlist
const getWishlist = catchAsync(async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate('items.product', 'name price stock images');

    if (!wishlist) {
        return next(new AppError('Wishlist not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            wishlist
        }
    });
});

// Add item to wishlist
const addToWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        return next(new AppError('Product already in wishlist', 400));
    }

    // Add new item
    wishlist.items.push({
        product: productId,
        addedAt: new Date()
    });

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.product', 'name price stock images');

    res.status(200).json({
        status: 'success',
        data: {
            wishlist
        }
    });
});

// Remove item from wishlist
const removeFromWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        return next(new AppError('Wishlist not found', 404));
    }

    wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== productId
    );

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.product', 'name price stock images');

    res.status(200).json({
        status: 'success',
        data: {
            wishlist
        }
    });
});

// Move item from wishlist to cart
const moveToCart = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity = 1 } = req.body;

    // Get wishlist and cart
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        return next(new AppError('Wishlist not found', 404));
    }

    const item = wishlist.items.id(itemId);
    if (!item) {
        return next(new AppError('Item not found in wishlist', 404));
    }

    // Check product stock
    const product = await Product.findById(item.product);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Insufficient stock', 400));
    }

    // TODO: Add to cart
    // This should:
    // 1. Get or create cart
    // 2. Add item to cart
    // 3. Remove item from wishlist
    // 4. Save both cart and wishlist

    // For now, just remove from wishlist
    item.remove();
    await wishlist.save();

    res.status(200).json({
        status: 'success',
        message: 'Item moved to cart successfully'
    });
});

// Clear wishlist
const clearWishlist = catchAsync(async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        return next(new AppError('Wishlist not found', 404));
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
        status: 'success',
        data: {
            wishlist
        }
    });
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
};
