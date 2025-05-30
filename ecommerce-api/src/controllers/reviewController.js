const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const {catchAsync} = require('../utils/catchAsync');
const mongoose = require('mongoose');

// Get product reviews
const getProductReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const reviews = await Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Review.countDocuments({ product: productId });

    res.status(200).json({
        status: 'success',
        data: {
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }
    });
});

// Create review
const createReview = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Check if user has purchased the product
    const order = await Order.findOne({
        user: req.user._id,
        'items.product': productId,
        orderStatus: 'delivered'
    });

    if (!order) {
        return next(new AppError('You can only review products you have purchased', 403));
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
        user: req.user._id,
        product: productId
    });

    if (existingReview) {
        return next(new AppError('You have already reviewed this product', 400));
    }

    // Create review
    const review = await Review.create({
        user: req.user._id,
        product: productId,
        rating,
        title,
        comment,
        images
    });

    // Update product average rating
    await updateProductRating(productId);

    // Populate user details
    await review.populate('user', 'name avatar');

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Update review
const updateReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only update your own reviews', 403));
    }

    // Update review
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    review.images = images;
    review.updatedAt = new Date();

    await review.save();

    // Update product average rating
    await updateProductRating(review.product);

    // Populate user details
    await review.populate('user', 'name avatar');

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Delete review
const deleteReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only delete your own reviews', 403));
    }

    const productId = review.product;

    // Use deleteOne instead of remove
    await Review.deleteOne({ _id: reviewId });

    // Update product average rating
    await updateProductRating(productId);

    res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully'
    });
});


// Get average rating for a product
const getProductRating = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
  
    const stats = await Review.aggregate([
      {
        $match: { product: new mongoose.Types.ObjectId(productId) }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: '$count' },
          ratingDistribution: {
            $push: {
              k: { $toString: '$_id' },
              v: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          ratingDistribution: { $arrayToObject: '$ratingDistribution' }
        }
      },
      {
        $lookup: {
          from: 'reviews',
          pipeline: [
            {
              $match: { product: new mongoose.Types.ObjectId(productId) }
            },
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' }
              }
            }
          ],
          as: 'avgStats'
        }
      },
      {
        $unwind: {
          path: '$avgStats',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          ratingDistribution: 1,
          averageRating: { $round: ['$avgStats.averageRating', 1] }
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {}
      }
    });
  });
  

// Like/Dislike review
const reactToReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { action } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    // Remove existing reaction if any
    if (review.likes.includes(req.user._id)) {
        review.likes = review.likes.filter(id => id.toString() !== req.user._id.toString());
    }
    if (review.dislikes.includes(req.user._id)) {
        review.dislikes = review.dislikes.filter(id => id.toString() !== req.user._id.toString());
    }

    // Add new reaction
    if (action === 'like') {
        review.likes.push(req.user._id);
    } else if (action === 'dislike') {
        review.dislikes.push(req.user._id);
    }

    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Report review
const reportReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    review.isReported = true;
    review.reportReason = reason;
    review.updatedAt = new Date();

    await review.save();

    res.status(200).json({
        status: 'success',
        message: 'Review reported successfully'
    });
});



module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getProductRating,
    reactToReview,
    reportReview
};
