const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Category name must be at least 2 characters long'],
        maxlength: [50, 'Category name cannot exceed 50 characters']
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
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    image: {
        type: String,
        default: 'default-category.png'
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
categorySchema.pre('save', function(next) {
    if (!this.isModified('name')) return next();
    
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    
    this.updatedAt = Date.now();
    next();
});

// Virtual for child categories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for product count
categorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

// Method to get all ancestor categories
categorySchema.methods.getAncestors = async function() {
    const ancestors = [];
    let current = this;
    
    while (current.parent) {
        current = await mongoose.model('Category').findById(current.parent);
        if (current) {
            ancestors.unshift(current);
        }
    }
    
    return ancestors;
};

// Method to get all descendant categories
categorySchema.methods.getDescendants = async function() {
    const descendants = [];
    const children = await mongoose.model('Category').find({ parent: this._id });
    
    for (const child of children) {
        descendants.push(child);
        const childDescendants = await child.getDescendants();
        descendants.push(...childDescendants);
    }
    
    return descendants;
};

// Indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ featured: 1 });
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);