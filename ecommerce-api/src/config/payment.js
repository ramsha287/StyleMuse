const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        throw new Error('Error creating payment intent');
    }
};

const createRefund = async (paymentIntentId, amount) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100), // Convert to cents
        });
        return refund;
    } catch (error) {
        throw new Error('Error creating refund');
    }
};

const createCustomer = async (email, name) => {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
        });
        return customer;
    } catch (error) {
        throw new Error('Error creating customer');
    }
};

module.exports = {
    createPaymentIntent,
    createRefund,
    createCustomer
};