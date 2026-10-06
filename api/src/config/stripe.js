const Stripe = require('stripe');
const ENV = require('./env.js');

if (!ENV.STRIPE_API_KEY) {
    console.warn('⚠️  STRIPE_API_KEY is not set — Stripe payments will fail.');
}

const stripe = new Stripe(ENV.STRIPE_API_KEY || 'sk_test_missing');

module.exports = stripe;
