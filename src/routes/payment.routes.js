const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const {
    createCheckoutSession,
    handleWebhook,
    verifyPayment,
    getInstructorEarnings
} = require('../controllers/payment.controller');

/**
 * @route   POST /api/payment/create-checkout-session
 * @desc    Create a Stripe checkout session for course purchase
 * @access  Private (Learner)
 */
router.post('/create-checkout-session', authenticate, checkRole('learner'), createCheckoutSession);

/**
 * @route   POST /api/payment/webhook
 * @desc    Stripe webhook endpoint (called by Stripe after payment)
 * @access  Public (but verified by Stripe signature)
 * @note    This route needs raw body, so it's handled specially in app.js
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

/**
 * @route   GET /api/payment/verify/:sessionId
 * @desc    Verify payment and get enrollment status
 * @access  Private
 */
router.get('/verify/:sessionId', authenticate, verifyPayment);

/**
 * @route   GET /api/payment/instructor/earnings
 * @desc    Get instructor's earnings from course sales
 * @access  Private (Instructor)
 */
router.get('/instructor/earnings', authenticate, checkRole('instructor'), getInstructorEarnings);

module.exports = router;
