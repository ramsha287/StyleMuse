const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth,admin } = require('../middlewares/authMiddleware');
const { validateCartItem } = require('../middlewares/validationMiddleware');

// All routes require authentication
router.use(auth);

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', validateCartItem, cartController.addToCart);

// Update cart item quantity
router.patch('/items', validateCartItem, cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:productId', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;