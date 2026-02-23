require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API Base URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Starting server...
startServer();
