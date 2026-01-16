const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    questionType: {
        type: DataTypes.ENUM('mcq', 'quiz'),
        allowNull: false,
        defaultValue: 'mcq'
    },
    // For MCQ: Array of {id, text, isCorrect}
    options: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
            isValidOptions(value) {
                if (this.questionType === 'mcq' && (!value || !Array.isArray(value) || value.length < 2)) {
                    throw new Error('MCQ questions must have at least 2 options');
                }
            }
        }
    },
    // For quiz type: the correct answer text
    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'questions',
    timestamps: true
});

module.exports = Question;
