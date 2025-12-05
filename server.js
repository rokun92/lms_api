require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const initializeSystem = require('./src/utils/initializeSystem');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Initialize system (create org and instructors)
        await initializeSystem();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 API Base URL: http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/docs\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Starting server...
startServer();
