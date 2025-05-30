const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { auth,admin } = require('../middlewares/authMiddleware');
const {
    validateShippingCalculation,
    validateShippingStatus,
    validateShippingMethod
} = require('../middlewares/validationMiddleware');

// Public Routes

// Get all active shipping methods for customers
router.get('/methods/customers', shippingController.getShippingMethods);

// ───────────────────────────────────────────────
// Protected Routes (Customers)
// ───────────────────────────────────────────────

router.use(auth); // Require authentication

// Calculate shipping cost
router.post('/calculate', validateShippingCalculation, shippingController.calculateShippingCost);

// Get shipping tracking
router.get('/tracking/:orderId', shippingController.getShippingTracking);

// ───────────────────────────────────────────────
// Admin Routes
// ───────────────────────────────────────────────
router.use(admin);


// Get all shipping methods (admin only)
router.get('/methods', shippingController.getAllShippingMethods);

// Get active shipping methods (admin only)
router.get('/methods/active', shippingController.getActiveShippingMethods);

// Create shipping method (admin only)
router.post('/methods', validateShippingMethod, shippingController.createShippingMethod);

// Update shipping method (admin only)
router.patch('/methods/:id', validateShippingMethod, shippingController.updateShippingMethod);

// Delete shipping method (admin only)
router.delete('/methods/:id', shippingController.deleteShippingMethod);

// Update shipping status (admin only)
router.patch('/:orderId/status', validateShippingStatus, shippingController.updateShippingStatus);

module.exports = router;
