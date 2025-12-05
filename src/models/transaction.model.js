const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    transactionType: {
        type: DataTypes.ENUM('instructor_payment', 'course_purchase'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'validated', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    relatedCourseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'transactions',
    timestamps: true
});

module.exports = Transaction;
