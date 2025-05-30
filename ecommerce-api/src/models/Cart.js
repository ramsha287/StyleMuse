const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        variant: {
            name: String,
            options: [{
                name: String,
                value: String
            }]
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        }
    }],
    coupon: {
        code: String,
        discount: {
            type: Number,
            min: [0, 'Discount cannot be negative']
        }
    },
    subtotal: {
        type: Number,
        default: 0,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative']
    },
    total: {
        type: Number,
        default: 0,
        min: [0, 'Total cannot be negative']
    },
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
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, variant = null) {
    const product = await mongoose.model('Product').findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        throw new Error('Insufficient stock');
    }

    const existingItem = this.items.find(item => 
        item.product.toString() === productId && 
        (!variant || JSON.stringify(item.variant) === JSON.stringify(variant))
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: productId,
            quantity,
            variant,
            price: product.price
        });
    }

    await this.calculateTotals();
    await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity, variant = null) {
    const item = this.items.find(item => 
        item.product.toString() === productId && 
        (!variant || JSON.stringify(item.variant) === JSON.stringify(variant))
    );

    if (!item) {
        throw new Error('Item not found in cart');
    }

    const product = await mongoose.model('Product').findById(productId);
    if (product.stock < quantity) {
        throw new Error('Insufficient stock');
    }

    item.quantity = quantity;
    await this.calculateTotals();
    await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, variant = null) {
    this.items = this.items.filter(item => 
        !(item.product.toString() === productId && 
        (!variant || JSON.stringify(item.variant) === JSON.stringify(variant)))
    );
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    this.coupon = null;
    this.subtotal = 0;
    this.tax = 0;
    this.total = 0;
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function(couponCode) {
    const coupon = await mongoose.model('Coupon').findOne({ 
        code: couponCode,
        isActive: true,
        startDate: { $lte: Date.now() },
        endDate: { $gte: Date.now() }
    });

    if (!coupon) {
        throw new Error('Invalid or expired coupon');
    }

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
        throw new Error('Coupon usage limit reached');
    }

    this.coupon = {
        code: coupon.code,
        discount: coupon.discount
    };

    await this.calculateTotals();
    await this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
    this.coupon = null;
    this.calculateTotals();
};

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.tax;

    if (this.coupon && this.coupon.discount) {
        this.total -= this.coupon.discount;
    }

    return this.total;
};

// Method to check if cart is empty
cartSchema.methods.isEmpty = function() {
    return this.items.length === 0;
};

// Method to get cart item count
cartSchema.methods.getItemCount = function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

// Indexes for better query performance
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Cart', cartSchema);