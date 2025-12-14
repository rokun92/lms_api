const stripe = require('../config/stripe');
const { Course, User, Enrollment, Transaction } = require('../models');
const crypto = require('crypto');

/**
 * Create a Stripe Checkout Session for course purchase
 * This uses Stripe Test Mode - no real money is charged
 */
const createCheckoutSession = async (req, res, next) => {
    try {
        const { courseId } = req.body;

        // Find course
        const course = await Course.findByPk(courseId, {
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId: courseId
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Handle free courses
        if (parseFloat(course.price) === 0) {
            const enrollment = await Enrollment.create({
                learnerId: req.user.id,
                courseId: course.id
            });

            return res.status(200).json({
                success: true,
                message: 'Enrolled successfully! You can now access the course content.',
                data: {
                    enrollment,
                    isFree: true
                }
            });
        }

        // Create Stripe Checkout Session for paid courses
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: course.title,
                            description: course.description || 'Online Course',
                            images: course.thumbnail ? [course.thumbnail] : [],
                        },
                        unit_amount: Math.round(parseFloat(course.price) * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/course-detail.html?id=${courseId}`,
            client_reference_id: `${req.user.id}:${courseId}`, // Store user and course info
            customer_email: req.user.email,
            metadata: {
                userId: req.user.id.toString(),
                courseId: courseId.toString(),
                instructorId: course.instructorId.toString(),
            }
        });

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        next(error);
    }
};

/**
 * Webhook handler for Stripe events
 * This is called by Stripe when payment is completed
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // For testing without webhook secret
            event = req.body;
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            // Extract metadata (IDs are UUIDs, not integers)
            const userId = session.metadata.userId;
            const courseId = session.metadata.courseId;
            const instructorId = session.metadata.instructorId;
            const amount = session.amount_total / 100; // Convert from cents

            console.log(`Payment completed: User ${userId} purchased Course ${courseId} for ৳${amount}`);

            // Create enrollment
            const enrollment = await Enrollment.create({
                learnerId: userId,
                courseId: courseId
            });

            // Create transaction record
            const transactionId = `STRIPE-${session.id}`;
            const transaction = await Transaction.create({
                transactionId,
                fromAccountId: null, // Stripe payment, no internal account
                toAccountId: null,
                amount: amount,
                transactionType: 'course_purchase',
                status: 'completed',
                relatedCourseId: courseId,
                description: `Stripe payment for course purchase (Session: ${session.id})`,
                metadata: {
                    stripeSessionId: session.id,
                    paymentIntent: session.payment_intent,
                    userId,
                    instructorId
                }
            });

            // Update instructor's earnings (you can track this separately)
            // For now, we'll just log it
            console.log(`Instructor ${instructorId} earned ৳${amount} from course sale`);

            console.log('Enrollment and transaction created successfully');
        } catch (error) {
            console.error('Error processing webhook:', error);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    res.json({ received: true });
};

/**
 * Verify payment session and get enrollment status
 * Also creates enrollment if webhook didn't fire (common in local dev)
 */
const verifyPayment = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Payment session not found'
            });
        }

        // Extract metadata (IDs are UUIDs, not integers)
        const userId = session.metadata.userId;
        const courseId = session.metadata.courseId;
        const instructorId = session.metadata.instructorId;
        const amount = session.amount_total / 100;

        // Check if enrollment already exists
        let enrollment = await Enrollment.findOne({
            where: {
                learnerId: userId,
                courseId: courseId
            },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail']
                }
            ]
        });

        // If payment is successful but enrollment doesn't exist, create it
        // This handles the case where webhook didn't fire (local development)
        if (session.payment_status === 'paid' && !enrollment) {
            console.log(`Creating enrollment for user ${userId} in course ${courseId} (webhook fallback)`);

            // Create enrollment
            enrollment = await Enrollment.create({
                learnerId: userId,
                courseId: courseId
            });

            // Fetch the enrollment with course details
            enrollment = await Enrollment.findOne({
                where: { id: enrollment.id },
                include: [
                    {
                        model: Course,
                        as: 'course',
                        attributes: ['id', 'title', 'thumbnail']
                    }
                ]
            });

            // Check if transaction already exists to avoid duplicates
            const existingTransaction = await Transaction.findOne({
                where: { transactionId: `STRIPE-${session.id}` }
            });

            if (!existingTransaction) {
                // Create transaction record
                await Transaction.create({
                    transactionId: `STRIPE-${session.id}`,
                    amount: amount,
                    transactionType: 'course_purchase',
                    status: 'completed',
                    relatedCourseId: courseId,
                    description: `Stripe payment for course purchase (Session: ${session.id})`,
                    metadata: {
                        stripeSessionId: session.id,
                        paymentIntent: session.payment_intent,
                        userId,
                        instructorId
                    }
                });
                console.log(`Transaction created for course purchase: ৳${amount}`);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                paymentStatus: session.payment_status,
                enrollment: enrollment,
                amount: amount,
                currency: session.currency
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        next(error);
    }
};

/**
 * Get instructor earnings from Stripe payments
 */
const getInstructorEarnings = async (req, res, next) => {
    try {
        const instructorId = req.user.id;

        // Get all completed transactions for this instructor's courses
        const transactions = await Transaction.findAll({
            where: {
                transactionType: 'course_purchase',
                status: 'completed'
            },
            include: [
                {
                    model: Course,
                    as: 'relatedCourse',
                    where: { instructorId },
                    attributes: ['id', 'title', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate total earnings
        const totalEarnings = transactions.reduce((sum, txn) => {
            return sum + parseFloat(txn.amount);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                totalEarnings: totalEarnings.toFixed(2),
                transactionCount: transactions.length,
                transactions: transactions.map(txn => ({
                    id: txn.id,
                    transactionId: txn.transactionId,
                    amount: txn.amount,
                    courseName: txn.relatedCourse?.title,
                    date: txn.createdAt,
                    status: txn.status
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching instructor earnings:', error);
        next(error);
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    verifyPayment,
    getInstructorEarnings
};
