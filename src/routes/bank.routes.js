const express = require('express');
const router = express.Router();
const {
    createTransaction,
    validateTransaction,
    getBalance,
    getTransactionHistory,
    getOrgBalance
} = require('../controllers/bank.controller');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Bank
 *   description: Banking and transaction management
 */

/**
 * @swagger
 * /api/bank/transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Bank]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *               - transactionType
 *             properties:
 *               fromAccountId:
 *                 type: string
 *               toAccountId:
 *                 type: string
 *               amount:
 *                 type: number
 *               transactionType:
 *                 type: string
 *                 enum: [instructor_payment, course_purchase]
 *               relatedCourseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Invalid input
 */
router.post('/transactions', createTransaction);

/**
 * @swagger
 * /api/bank/transactions/{id}/validate:
 *   post:
 *     summary: Validate transaction with bank credentials
 *     tags: [Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - secret
 *             properties:
 *               accountNumber:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction validated and completed
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: Transaction not found
 */
router.post('/transactions/:id/validate', validateTransaction);

/**
 * @swagger
 * /api/bank/balance:
 *   get:
 *     summary: Get current balance (requires auth)
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account balance
 *       401:
 *         description: Unauthorized
 */
router.get('/balance', authenticate, getBalance);

/**
 * @swagger
 * /api/bank/transactions:
 *   get:
 *     summary: Get transaction history (requires auth)
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', authenticate, getTransactionHistory);

/**
 * @swagger
 * /api/bank/org-balance:
 *   get:
 *     summary: Get organization balance
 *     tags: [Bank]
 *     responses:
 *       200:
 *         description: Organization balance
 */
router.get('/org-balance', getOrgBalance);

module.exports = router;
