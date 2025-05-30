const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth,admin } = require('../middlewares/authMiddleware');
const { validateWishlistItem } = require('../middlewares/validationMiddleware');

// All routes require authentication
router.use(auth);

// Get wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/items', validateWishlistItem, wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/items/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router;