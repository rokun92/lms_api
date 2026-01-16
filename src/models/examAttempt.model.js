const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamAttempt = sequelize.define('ExamAttempt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    enrollmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'enrollments',
            key: 'id'
        }
    },
    // Student answers: {questionId: selectedOptionId/answer}
    answers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    // Score as percentage (0-100)
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    // Whether the student passed (score >= 70)
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    // Total points earned
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // Total possible points
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'exam_attempts',
    timestamps: true
});

module.exports = ExamAttempt;
