const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    contentType: {
        type: DataTypes.ENUM('text', 'video', 'audio'),
        allowNull: false
    },
    // For text content
    textContent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // For uploaded files (video/audio) - Cloudinary URL
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    filePublicId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // For MCQ content (stored as JSON)
    mcqContent: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: process.env.COURSE_PRICE || 100
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Duration of video/audio content in seconds
    contentDurationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Required reading time for text content (in minutes)
    requiredReadingMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Passing score for exam (percentage)
    passingScore: {
        type: DataTypes.INTEGER,
        defaultValue: 70
    }
}, {
    tableName: 'courses',
    timestamps: true
});

module.exports = Course;
