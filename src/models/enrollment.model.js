const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    learnerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    // Content progress (0-100%) - video/audio completion or reading time
    contentProgress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    contentCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Time spent on content (for text content tracking)
    timeSpentSeconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Exam status
    examPassed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    examScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    examAttemptCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'enrollments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['learnerId', 'courseId']
        }
    ]
});

module.exports = Enrollment;
