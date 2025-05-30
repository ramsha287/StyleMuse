const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, admin } = require('../middlewares/authMiddleware');
const { validatePayment, validateRefund } = require('../middlewares/validationMiddleware');

// Admin only routes
router.post('/:transactionId/refund', auth, admin, validateRefund, paymentController.processRefund);
router.get('/statistics', auth, admin, paymentController.getPaymentStatistics);

// Public routes
router.post('/verify/:transactionId', auth, paymentController.verifyPayment);

// Protected routes
router.post('/process', auth, validatePayment, paymentController.processPayment);
router.get('/:transactionId', auth, paymentController.getPaymentDetails);



module.exports = router;