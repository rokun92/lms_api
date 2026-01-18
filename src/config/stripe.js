require('dotenv').config();
const Stripe = require('stripe');

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing in environment variables!');
} 

const stripe = new Stripe(apiKey || 'sk_test_dummy_key');

module.exports = stripe;
