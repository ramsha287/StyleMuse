const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middlewares/authMiddleware');
const { validateOrder, validateOrderStatus } = require('../middlewares/validationMiddleware');

// Protected routes - apply auth middleware
router.use(auth);

// User routes
router.get('/my-orders', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrder);
router.post('/', validateOrder, orderController.createOrder);
router.get('/:orderId/details', orderController.getOrderDetails);
router.patch('/add-tracking/:orderId', orderController.addTrackingNumber);
router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/return', orderController.returnOrder);

// Admin routes - apply admin auth middleware
router.use(admin);

// Admin only routes
router.get('/', orderController.getAllOrders);
router.patch('/:orderId/status', validateOrderStatus, orderController.updateOrderStatus);

module.exports = router;