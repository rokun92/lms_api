const { Transaction, Course } = require('../models');

/**
 * Create a new transaction
 */
const createTransaction = async (req, res, next) => {
    try {
        const { amount, transactionType, relatedCourseId, description } = req.body;

        if (!amount || !transactionType) {
            return res.status(400).json({
                success: false,
                message: 'Amount and transaction type are required'
            });
        }

        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const transaction = await Transaction.create({
            transactionId,
            amount,
            transactionType,
            status: 'pending',
            relatedCourseId: relatedCourseId || null,
            description: description || `${transactionType} transaction`
        });

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        next(error);
    }
};

/**
 * Validate a transaction
 */
const validateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { accountNumber, secret } = req.body;

        if (!accountNumber || !secret) {
            return res.status(400).json({
                success: false,
                message: 'Account number and secret are required'
            });
        }

        const transaction = await Transaction.findByPk(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Transaction is already ${transaction.status}`
            });
        }

        // For simulation purposes, we accept any validation
        // In a real system, this would check against actual bank records
        await transaction.update({
            status: 'completed',
            metadata: {
                ...transaction.metadata,
                validatedAt: new Date().toISOString(),
                validatedBy: accountNumber
            }
        });

        res.status(200).json({
            success: true,
            message: 'Transaction validated successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Validate transaction error:', error);
        next(error);
    }
};

/**
 * Get balance (simulated)
 */
const getBalance = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Calculate total earnings from completed course purchases
        const transactions = await Transaction.findAll({
            where: {
                transactionType: 'course_purchase',
                status: 'completed'
            },
            include: [
                {
                    model: Course,
                    as: 'relatedCourse',
                    where: { instructorId: userId },
                    attributes: ['id', 'title', 'price']
                }
            ]
        });

        const balance = transactions.reduce((sum, txn) => {
            return sum + parseFloat(txn.amount);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                balance: balance.toFixed(2),
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        next(error);
    }
};

/**
 * Get transaction history for authenticated user
 */
const getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let transactions;

        if (userRole === 'instructor') {
            // Get transactions related to instructor's courses
            transactions = await Transaction.findAll({
                where: {
                    transactionType: 'course_purchase'
                },
                include: [
                    {
                        model: Course,
                        as: 'relatedCourse',
                        where: { instructorId: userId },
                        attributes: ['id', 'title', 'price']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
        } else {
            // For learners, get all transactions they're involved in
            transactions = await Transaction.findAll({
                where: {
                    '$metadata.userId$': userId
                },
                include: [
                    {
                        model: Course,
                        as: 'relatedCourse',
                        attributes: ['id', 'title', 'price']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // If metadata query doesn't work, fall back to all transactions
            if (!transactions || transactions.length === 0) {
                transactions = await Transaction.findAll({
                    include: [
                        {
                            model: Course,
                            as: 'relatedCourse',
                            attributes: ['id', 'title', 'price']
                        }
                    ],
                    order: [['createdAt', 'DESC']],
                    limit: 10
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                transactions: transactions.map(t => ({
                    id: t.id,
                    transactionId: t.transactionId,
                    amount: t.amount,
                    transactionType: t.transactionType,
                    status: t.status,
                    description: t.description || `${t.transactionType} - ${t.relatedCourse?.title || 'Unknown Course'}`,
                    courseName: t.relatedCourse?.title,
                    createdAt: t.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        next(error);
    }
};

/**
 * Get organization balance (simulated)
 */
const getOrgBalance = async (req, res, next) => {
    try {
        // Get total of all completed transactions
        const transactions = await Transaction.findAll({
            where: {
                status: 'completed'
            }
        });

        const totalBalance = transactions.reduce((sum, txn) => {
            return sum + parseFloat(txn.amount);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                balance: totalBalance.toFixed(2),
                currency: 'USD',
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        console.error('Get org balance error:', error);
        next(error);
    }
};

module.exports = {
    createTransaction,
    validateTransaction,
    getBalance,
    getTransactionHistory,
    getOrgBalance
};
