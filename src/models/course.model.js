/**
 * Course Model
 * 
 * Represents a course in the LMS system.
 * Courses can contain text, video, or audio content and are created by instructors.
 * Exams are managed separately through the Question model.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { CONTENT_TYPES, COURSE_STATUS, DEFAULT_COURSE_PRICE, DEFAULT_PASSING_SCORE } = require('../constants');

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
        type: DataTypes.ENUM(Object.values(CONTENT_TYPES)),
        allowNull: false
    },
    // For text-based courses
    textContent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // For video/audio courses - Cloudinary URL
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    filePublicId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: process.env.COURSE_PRICE || DEFAULT_COURSE_PRICE
    },
    status: {
        type: DataTypes.ENUM(Object.values(COURSE_STATUS)),
        defaultValue: COURSE_STATUS.ACTIVE
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
    // Duration tracking for video/audio content
    contentDurationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Reading time tracking for text content
    requiredReadingMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Exam configuration
    passingScore: {
        type: DataTypes.INTEGER,
        defaultValue: DEFAULT_PASSING_SCORE
    }
}, {
    tableName: 'courses',
    timestamps: true,
    indexes: [
        {
            fields: ['instructorId']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Course;
