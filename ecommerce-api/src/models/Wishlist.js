const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required']
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
wishlistSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = async function(productId) {
    const product = await mongoose.model('Product').findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (!this.products.some(item => item.product.toString() === productId)) {
        this.products.push({
            product: productId,
            addedAt: Date.now()
        });
        await this.save();
    }
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(item => 
        item.product.toString() !== productId
    );
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
    this.products = [];
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.some(item => 
        item.product.toString() === productId
    );
};

// Method to get wishlist item count
wishlistSchema.methods.getItemCount = function() {
    return this.products.length;
};

// Method to get products with details
wishlistSchema.methods.getProductsWithDetails = async function() {
    const products = await mongoose.model('Product')
        .find({
            _id: { $in: this.products.map(item => item.product) }
        })
        .select('name price images stock averageRating');

    return products.map(product => ({
        ...product.toObject(),
        addedAt: this.products.find(item => 
            item.product.toString() === product._id.toString()
        ).addedAt
    }));
};

// Indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);