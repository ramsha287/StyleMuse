const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer','gpay','paytm']
    },
    status: {
        type: String,
        required: [true, 'Payment status is required'],
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled', 'expired'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentDetails: {
        cardNumber: {
            type: String,
            select: false
        },
        cardType: String,
        last4: String,
        expiryMonth: String,
        expiryYear: String,
        cvv: {
            type: String,
            select: false
        },
        paypalEmail: String,
        bankAccount: String,
        bankName: String
    },
    refunds: [{
        amount: {
            type: Number,
            required: true,
            min: [0, 'Refund amount cannot be negative']
        },
        reason: {
            type: String,
            required: true,
            enum: ['customer_request', 'product_return', 'fraud', 'other']
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'failed','partially_refunded'],
            default: 'pending'
        },
        transactionId: String,
        processedAt: Date,
        notes: String
    }],
    totalRefunded: {
        type: Number,
        default: 0,
        min: [0, 'Total refunded amount cannot be negative']
    },
    error: {
        code: String,
        message: String,
        details: Object
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        deviceInfo: Object
    }
}, { timestamps: true });

// Update timestamp on save
paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to process payment
paymentSchema.methods.processRefund = async function(amount, reason) {
    if (amount + this.totalRefunded > this.amount) {
        throw new Error('Refund amount exceeds remaining refundable amount');
    }

    const refund = {
        amount,
        reason,
        status: 'pending',
        transactionId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processedAt: null,
        notes: null
    };

    try {
        // Simulate refund logic
        refund.status = 'completed';
        refund.processedAt = Date.now();
        this.refunds.push(refund);
        this.totalRefunded += refund.amount;

        // Update overall status
        const totalRefunded = this.refunds.reduce((sum, r) => sum + r.amount, 0);
        if (totalRefunded === this.amount) {
            this.status = 'refunded';
        } else if (totalRefunded > 0) {
            this.status = 'partially_refunded';
        }

        await this.save();
        return refund;
    } catch (error) {
        refund.status = 'failed';
        refund.notes = error.message;
        this.refunds.push(refund);
        await this.save();
        throw error;
    }
};


// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
    if (amount + this.totalRefunded > this.amount) {
        throw new Error('Refund amount exceeds remaining refundable amount');
    }

    const refund = {
        amount,
        reason,
        status: 'pending',
        transactionId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processedAt: null,
        notes: null
    };

    try {
        // TODO: Implement actual refund processing logic
        refund.status = 'completed';
        refund.processedAt = Date.now();
        this.refunds.push(refund);
        this.totalRefunded += refund.amount;

        // Update payment status
        const totalRefunded = this.refunds.reduce((sum, r) => sum + r.amount, 0);
        if (totalRefunded === this.amount) {
            this.status = 'refunded';
        } else if (totalRefunded > 0) {
            this.status = 'partially_refunded';
        }

        try {
            await this.save();
        } catch (error) {
            this.status = 'failed';
            this.error = {
                code: error.code || 'SAVE_FAILED',
                message: error.message,
                details: error.details
            };
            await this.save();
            throw error;
        }
        
        return refund;
    } catch (error) {
        refund.status = 'failed';
        refund.notes = error.message;
        this.refunds.push(refund);
        if (refund.status === 'completed') {
            this.totalRefunded += refund.amount;
        }
        await this.save();
        throw error;
    }
};

// Method to get payment statistics
paymentSchema.methods.getStatistics = function() {
    const totalRefunded = this.refunds.reduce((sum, r) => sum + r.amount, 0);
    
    return {
        amount: this.amount,
        totalRefunded,
        remainingAmount: this.amount - totalRefunded,
        refundCount: this.refunds.length,
        status: this.status
    };
};

// Indexes for better query performance
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'refunds.status': 1 });

module.exports = mongoose.model('Payment', paymentSchema);