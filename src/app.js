const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const instructorRoutes = require('./routes/instructor.routes');
const learnerRoutes = require('./routes/learner.routes');
const courseRoutes = require('./routes/course.routes');
const paymentRoutes = require('./routes/payment.routes');
const bankRoutes = require('./routes/bank.routes');

const app = express();

// Stripe webhook needs raw body, so we handle it before JSON parsing
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LMS API Server is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            instructor: '/api/instructor',
            learner: '/api/learner',
            courses: '/api/courses',
            payment: '/api/payment',
            bank: '/api/bank',
            docs: '/docs'
        }
    });
});

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bank', bankRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
