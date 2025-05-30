const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Brand name must be at least 2 characters long'],
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    logo: {
        type: String,
        default: 'default-brand.png'
    },
    website: {
        type: String,
        trim: true,
        match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please enter a valid URL']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
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

// Generate slug before saving
brandSchema.pre('save', function(next) {
    if (!this.isModified('name')) return next();
    
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    
    this.updatedAt = Date.now();
    next();
});

// Virtual for product count
brandSchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'brand',
    count: true
});

// Method to get all products for this brand
brandSchema.methods.getProducts = async function(options = {}) {
    const query = { brand: this._id };
    
    if (options.isActive !== undefined) {
        query.isActive = options.isActive;
    }
    
    if (options.featured !== undefined) {
        query.featured = options.featured;
    }
    
    return await mongoose.model('Product')
        .find(query)
        .sort(options.sort || { createdAt: -1 })
        .limit(options.limit || 0);
};

// Method to get brand statistics
brandSchema.methods.getStatistics = async function() {
    const stats = await mongoose.model('Product').aggregate([
        { $match: { brand: this._id } },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                averagePrice: { $avg: '$price' },
                totalStock: { $sum: '$stock' },
                averageRating: { $avg: '$averageRating' }
            }
        }
    ]);

    return stats[0] || {
        totalProducts: 0,
        averagePrice: 0,
        totalStock: 0,
        averageRating: 0
    };
};

// Indexes for better query performance
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });
brandSchema.index({ featured: 1 });
brandSchema.index({ order: 1 });

module.exports = mongoose.model('Brand', brandSchema);