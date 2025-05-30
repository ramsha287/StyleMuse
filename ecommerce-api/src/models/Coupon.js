const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [3, 'Coupon code must be at least 3 characters long'],
        maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    discount: {
        type: Number,
        required: [true, 'Discount amount is required'],
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100']
    },
    discountType: {
        type: String,
        required: [true, 'Discount type is required'],
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    minPurchase: {
        type: Number,
        min: [0, 'Minimum purchase cannot be negative'],
        default: 0
    },
    maxDiscount: {
        type: Number,
        min: [0, 'Maximum discount cannot be negative']
    },
    maxUsage: {
        type: Number,
        min: [1, 'Maximum usage must be at least 1']
    },
    usageCount: {
        type: Number,
        default: 0,
        min: [0, 'Usage count cannot be negative']
    },
    usagePerUser: {
        type: Number,
        min: [1, 'Usage per user must be at least 1']
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        count: {
            type: Number,
            default: 0
        }
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
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
couponSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
    const now = Date.now();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        this.usageCount < this.maxUsage
    );
};

// Method to check if user can use coupon
couponSchema.methods.canBeUsedBy = function(userId) {
    const userUsage = this.usedBy.find(u => u.user.toString() === userId.toString());
    return !userUsage || userUsage.count < this.usagePerUser;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal) {
    if (subtotal < this.minPurchase) {
        return 0;
    }

    let discount = this.discount;
    
    if (this.discountType === 'percentage') {
        discount = (subtotal * this.discount) / 100;
        
        if (this.maxDiscount) {
            discount = Math.min(discount, this.maxDiscount);
        }
    }

    return discount;
};

// Method to apply coupon
couponSchema.methods.apply = async function(userId) {
    if (!this.isValid()) {
        throw new Error('Coupon is not valid');
    }

    if (!this.canBeUsedBy(userId)) {
        throw new Error('User has reached maximum usage limit');
    }

    const userUsage = this.usedBy.find(u => u.user.toString() === userId.toString());
    if (userUsage) {
        userUsage.count += 1;
    } else {
        this.usedBy.push({
            user: userId,
            count: 1
        });
    }

    this.usageCount += 1;
    await this.save();
};

// Method to deactivate coupon
couponSchema.methods.deactivate = function() {
    this.isActive = false;
};

// Method to reactivate coupon
couponSchema.methods.reactivate = function() {
    this.isActive = true;
};

// Method to get coupon statistics
couponSchema.methods.getStatistics = function() {
    return {
        usageCount: this.usageCount,
        remainingUsage: this.maxUsage - this.usageCount,
        isActive: this.isActive,
        isExpired: Date.now() > this.endDate,
        isNotStarted: Date.now() < this.startDate
    };
};

// Indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ categories: 1 });
couponSchema.index({ products: 1 });
couponSchema.index({ 'usedBy.user': 1 });

module.exports = mongoose.model('Coupon', couponSchema);