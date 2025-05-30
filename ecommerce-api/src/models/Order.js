const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        variant: {
            name: String,
            options: [{
                name: String,
                value: String
            }]
        }
    }],
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        }
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'gpay', 'paytm'],
    },
    paymentStatus: {
        type: String,
        required: [true, 'Payment status is required'],
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    orderStatus: {
        type: String,
        required: [true, 'Order status is required'],
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
        default: 'pending'
    },

    shippingMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingMethod',
        required: [true, 'Shipping method is required']
    },
    shippingCost: {
        type: Number,
        required: [true, 'Shipping cost is required'],
        min: [0, 'Shipping cost cannot be negative']
    },
    shippingUpdates: [
        {
            status: { type: String, required: true },
            location: { type: String },
            description: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: [true, 'Tax is required'],
        min: [0, 'Tax cannot be negative']
    },
    discount: {
        code: String,
        amount: {
            type: Number,
            min: [0, 'Discount amount cannot be negative']
        }
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
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

const orderStatusHistorySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const OrderStatusHistory = mongoose.models.OrderStatusHistory || mongoose.model('OrderStatusHistory', orderStatusHistorySchema);

// Update timestamp on save
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for order status history
orderSchema.virtual('statusHistory', {
    ref: 'OrderStatusHistory',
    localField: '_id',
    foreignField: 'order'
});

// Method to calculate order totals
orderSchema.methods.calculateTotals = function () {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shippingCost + this.tax;

    if (this.discount && this.discount.amount) {
        this.total -= this.discount.amount;
    }

    return this.total;
};

// Method to update order status
orderSchema.methods.updateStatus = async function (newStatus) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid order status');
    }

    // Prevent shipping or delivery before payment is completed
    if (['shipped', 'delivered'].includes(newStatus) && this.paymentStatus !== 'completed') {
        throw new Error(`Cannot mark order as '${newStatus}' while payment is '${this.paymentStatus}'`);
    }

    this.orderStatus = newStatus;

    if (newStatus === 'delivered') {
        this.actualDeliveryDate = Date.now();
    }

    this.shippingUpdates.push({
        status: newStatus,
        description: `Order ${newStatus} at ${new Date().toLocaleString()}`,
        location: 'Final Destination'
    });

    await this.save();

    await OrderStatusHistory.create({
        order: this._id,
        status: newStatus,
        date: Date.now()
    });
};



// Method to process refund
orderSchema.methods.processRefund = async function (reason) {
    if (this.paymentStatus !== 'completed') {
        throw new Error('Only completed orders can be refunded');
    }

    this.paymentStatus = 'refunded';
    await this.save();

    // Create refund record
    await mongoose.model('Refund').create({
        order: this._id,
        amount: this.total,
        reason,
        status: 'pending'
    });
};

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.zipCode': 1 });
orderSchema.index({ trackingNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);