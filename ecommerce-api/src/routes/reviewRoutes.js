const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {auth,admin} = require('../middlewares/authMiddleware');
const { validateReview, validateReviewReaction, validateReviewReport } = require('../middlewares/validationMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/rating', reviewController.getProductRating);

// Protected routes
router.use(auth);

// Create review
router.post('/product/:productId', validateReview, reviewController.createReview);

// Update review
router.patch('/:reviewId', validateReview, reviewController.updateReview);

// Delete review
router.delete('/:reviewId', reviewController.deleteReview);

// Like/Dislike review
router.post('/:reviewId/react', validateReviewReaction, reviewController.reactToReview);

// Report review
router.post('/:reviewId/report', validateReviewReport, reviewController.reportReview);



module.exports = router;