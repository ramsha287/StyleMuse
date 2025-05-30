const Payment = require('../models/Payment');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const {catchAsync} = require('../utils/catchAsync');

// Process payment
const processPayment = catchAsync(async (req, res, next) => {
    const { orderId, paymentMethod, paymentDetails } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Ensure the order has a total amount
    if (!order.total || order.total <= 0) {
        return next(new AppError('Order total amount is invalid', 400));
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create payment
    const payment = await Payment.create({
        order: orderId,
        user: req.user._id,
        amount: order.total,
        currency: order.paymentDetails.currency || 'INR' || 'USD',
        paymentMethod,
        paymentDetails,
        status: "processing",
        transactionId,
        metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            deviceInfo: req.body.deviceInfo
        }
    });

    // Simulate payment processing (set status)
    payment.status = "completed"; // or "processing"
    payment.transactionId = transactionId;
    await payment.save();

    // Update order payment status
    order.paymentStatus = payment.status;
    order.paymentDetails = {
        transactionId: payment.transactionId,
        paymentDate: Date.now(),
        amount: payment.amount,
        currency: payment.currency
    };
    await order.save();

    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});



// Verify payment status
const verifyPayment = catchAsync(async (req, res, next) => {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    // TODO: Implement actual payment verification logic with payment gateway
    // For now, we'll just return the current status
    res.status(200).json({
        status: 'success',
        data: {
            status: payment.status,
            transactionId: payment.transactionId
        }
    });
});



// Process refund (Admin only)
const processRefund = catchAsync(async (req, res, next) => {
    const { transactionId } = req.params;
    const { amount, reason, refundMethod } = req.body;

    // Find payment by transactionId (not by _id)
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    // Process refund
    const refund = await payment.processRefund(amount, reason);

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
        order.paymentStatus = payment.status;
        await order.save();
    }

    res.status(200).json({
        status: 'success',
        data: {
            refund
        }
    });
});



// Get payment details
const getPaymentDetails = catchAsync(async (req, res, next) => {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({transactionId})
        .populate('order', 'orderNumber total')
        .populate('user', 'name email');

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    // Check if user has access to this payment
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to access this payment', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});



// Get payment statistics (Admin only)
const getPaymentStatistics = catchAsync(async (req, res, next) => {
    try {
        const stats = await Payment.aggregate([
            {
                $addFields: {
                    refunds: { $ifNull: ["$refunds", []] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalRefunded: { $sum: { $reduce: { input: '$refunds', initialValue: 0, in: { $add: ['$$value', '$$this.amount'] } } } },
                    paymentMethods: { $addToSet: '$paymentMethod' },
                    statusCounts: {
                        $push: {
                            status: '$status',
                            count: 1
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPayments: 1,
                    totalAmount: 1,
                    totalRefunded: 1,
                    netAmount: { $subtract: ['$totalAmount', '$totalRefunded'] },
                    paymentMethods: 1,
                    statusCounts: {
                        $reduce: {
                            input: '$statusCounts',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    { 
                                        [ '$$this.status' ]: { 
                                            $add: [ { $ifNull: [ '$$value[$$this.status]', 0 ] }, 1 ] 
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                statistics: stats[0] || {
                    totalPayments: 0,
                    totalAmount: 0,
                    totalRefunded: 0,
                    netAmount: 0,
                    paymentMethods: [],
                    statusCounts: {}
                }
            }
        });
    } catch (error) {
        return next(new AppError('Failed to fetch payment statistics', 500));
    }
});

module.exports = {
    processPayment,
    verifyPayment,
    processRefund,
    getPaymentDetails,
    getPaymentStatistics
};
