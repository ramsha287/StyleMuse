const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    video: {
        type: String,
        required: false
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    specifications: {
        type: Map,
        of: String
    },
    variants: [{
        name: String,
        options: [{
            name: String,
            value: String
        }],
        price: Number,
        stock: Number,
        sku: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: [true, 'SKU is required']
    },
    discountStartDate: Date,
    discountEndDate: Date,
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
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.calculateAverageRating();  // Auto-calculate on every save
    next();
});


// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.numReviews = 0;
        return;
    }

    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.numReviews = this.ratings.length;
};

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (!this.discount || !this.discountStartDate || !this.discountEndDate) {
        return this.price;
    }

    const now = Date.now();
    if (now < this.discountStartDate || now > this.discountEndDate) {
        return this.price;
    }

    return this.price * (1 - this.discount / 100);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock <= 0) return 'out_of_stock';
    if (this.stock < 10) return 'low_stock';
    return 'in_stock';
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);