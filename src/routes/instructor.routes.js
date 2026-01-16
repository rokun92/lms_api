const express = require('express');
const router = express.Router();
const {
    uploadCourse,
    getMyCourses,
    getProfile,
    updateProfile,
    getTransactionHistory
} = require('../controllers/instructor.controller');
const {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion
} = require('../controllers/exam.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor course and profile management
 */

// All routes require authentication and instructor role
router.use(authenticate);
router.use(checkRole('instructor'));

/**
 * @swagger
 * /api/instructor/courses:
 *   post:
 *     summary: Upload a new course
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - contentType
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               contentType:
 *                 type: string
 *                 enum: [text, video, audio, mcq]
 *               textContent:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               mcqContent:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course uploaded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/courses', upload.single('file'), uploadCourse);

/**
 * @swagger
 * /api/instructor/courses:
 *   get:
 *     summary: Get instructor's courses
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of instructor's courses
 *       401:
 *         description: Unauthorized
 */
router.get('/courses', getMyCourses);

/**
 * @swagger
 * /api/instructor/profile:
 *   get:
 *     summary: Get instructor profile with bank info
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/instructor/profile:
 *   put:
 *     summary: Update instructor profile
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               expertise:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/instructor/transactions:
 *   get:
 *     summary: Get instructor's transaction history
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', getTransactionHistory);

/**
 * @swagger
 * /api/instructor/courses/{courseId}/questions:
 *   post:
 *     summary: Add a question to a course
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - questionType
 *             properties:
 *               questionText:
 *                 type: string
 *               questionType:
 *                 type: string
 *                 enum: [mcq, quiz]
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               correctAnswer:
 *                 type: string
 *               points:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Question added successfully
 */
router.post('/courses/:courseId/questions', addQuestion);

/**
 * @swagger
 * /api/instructor/courses/{courseId}/questions:
 *   get:
 *     summary: Get all questions for a course (with answers)
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get('/courses/:courseId/questions', getQuestions);

/**
 * @swagger
 * /api/instructor/questions/{questionId}:
 *   put:
 *     summary: Update a question
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 */
router.put('/questions/:questionId', updateQuestion);

/**
 * @swagger
 * /api/instructor/questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 */
router.delete('/questions/:questionId', deleteQuestion);

module.exports = router;
