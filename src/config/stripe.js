require('dotenv').config();
const Stripe = require('stripe');

// In test mode, use test keys (starts with sk_test_)
const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing in environment variables!');
} else {
    const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}

const stripe = new Stripe(apiKey || 'sk_test_dummy_key');

module.exports = stripe;
