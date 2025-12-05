require('dotenv').config();
const Stripe = require('stripe');

// Initialize Stripe with your secret key
// In test mode, use test keys (starts with sk_test_)
const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing in environment variables!');
} else {
    // Log the first few characters to verify it's loaded correctly (don't log the full key)
    const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`✅ Stripe Config - Loaded Key: ${maskedKey} (Length: ${apiKey.length})`);

    if (apiKey.includes('your_key_here')) {
        console.error('❌ ERROR: You are using a placeholder Stripe key! Please update .env with your actual key.');
    }
}

const stripe = new Stripe(apiKey || 'sk_test_dummy_key');

module.exports = stripe;
