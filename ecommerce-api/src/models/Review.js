const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters long'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    images: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length <= 5;
            },
            message: 'Cannot upload more than 5 images'
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    isHelpful: {
        type: Boolean,
        default: false
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportReason: {
        type: String,
        enum: ['inappropriate', 'spam', 'fake', 'other']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
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
reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to like review
reviewSchema.methods.like = function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        this.dislikes = this.dislikes.filter(id => id.toString() !== userId.toString());
    }
};

// Method to dislike review
reviewSchema.methods.dislike = function (userId) {
    if (!this.dislikes.includes(userId)) {
        this.dislikes.push(userId);
        this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    }
};

// Method to report review
reviewSchema.methods.report = function (userId, reason) {
    if (!this.isReported) {
        this.isReported = true;
        this.reportReason = reason;
    }
};

// Method to mark as helpful
reviewSchema.methods.markAsHelpful = function () {
    this.isHelpful = true;
};

// Method to verify purchase
reviewSchema.methods.verifyPurchase = function () {
    this.isVerifiedPurchase = true;
};

// Method to approve review
reviewSchema.methods.approve = function () {
    this.status = 'approved';
};

// Method to reject review
reviewSchema.methods.reject = function () {
    this.status = 'rejected';
};

// Method to get review statistics
reviewSchema.methods.getStatistics = function () {
    return {
        likes: this.likes.length,
        dislikes: this.dislikes.length,
        helpful: this.isHelpful,
        verified: this.isVerifiedPurchase
    };
};

// Indexes for better query performance
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isHelpful: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

module.exports = mongoose.model('Review', reviewSchema);