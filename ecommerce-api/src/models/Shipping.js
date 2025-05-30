const mongoose = require('mongoose');

const estimatedDaysSchema = new mongoose.Schema({
    min: {
        type: Number,
        required: [true, 'Minimum estimated days is required'],
        min:1,
    },
    max: {
        type: Number,
        required: [true, 'Maximum estimated days is required'],
        min: 1,
    },
});


const shippingMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide shipping method name'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide shipping method description']
    },
    baseCost: {
        type: Number,
        required: [true, 'Please provide base shipping price'],
        min: 0
    },
    estimatedDays: {
        type: estimatedDaysSchema,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    weightLimit: {
        type: Number,
        min: 0
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    regions: [{
        country: String,
        states: [String]
    }],
    priceRules: [{
        minWeight: Number,
        maxWeight: Number,
        price: Number
    }],
    handlingFee: {
        type: Number,
        default: 0
    },
    freeShippingThreshold: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

// Method to calculate shipping cost
shippingMethodSchema.methods.calculateShippingCost = function (weight, orderTotal) {
    if (!this.isActive) return null;

    let cost = this.basePrice + this.handlingFee;

    // Apply weight-based pricing if rules exist
    if (this.priceRules && this.priceRules.length > 0) {
        const applicableRule = this.priceRules.find(rule =>
            weight >= rule.minWeight && weight <= rule.maxWeight
        );

        if (applicableRule) {
            cost = applicableRule.price + this.handlingFee;
        }
    }

    // Apply free shipping if threshold is met
    if (this.freeShippingThreshold && orderTotal >= this.freeShippingThreshold) {
        cost = 0;
    }

    return cost;
};

// Method to check if shipping method is available for region
shippingMethodSchema.methods.isAvailableForRegion = function (country, state = null) {
    if (!this.isActive) return false;

    const region = this.regions.find(r => r.country === country);
    if (!region) return false;

    if (state && region.states.length > 0) {
        return region.states.includes(state);
    }

    return true;
};

// Method to check if weight is within limits
shippingMethodSchema.methods.isWeightWithinLimits = function (weight) {
    if (!this.weightLimit) return true;
    return weight <= this.weightLimit;
};

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

module.exports = ShippingMethod;