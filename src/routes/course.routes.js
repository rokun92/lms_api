const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    purchaseCourse,
    getCourseContent,
    completeCourse
} = require('../controllers/course.controller');
const {
    updateProgress,
    getProgress,
    getExam,
    submitExam
} = require('../controllers/progress.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course browsing, purchasing, and completion
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all available courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all courses
 */
router.get('/', getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseById);

/**
 * @swagger
 * /api/courses/{id}/purchase:
 *   post:
 *     summary: Purchase a course (requires bank validation)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
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
 *         description: Course purchased successfully
 *       400:
 *         description: Invalid input or already enrolled
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/purchase', authenticate, checkRole('learner'), purchaseCourse);

/**
 * @swagger
 * /api/courses/{id}/content:
 *   get:
 *     summary: Access course content (enrolled only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 */
router.get('/:id/content', authenticate, checkRole('learner'), getCourseContent);

/**
 * @swagger
 * /api/courses/{id}/progress:
 *   post:
 *     summary: Update content progress (video position or reading time)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPositionSeconds:
 *                 type: integer
 *                 description: Current playback position for video/audio
 *               timeSpentSeconds:
 *                 type: integer
 *                 description: Time spent reading for text content
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.post('/:id/progress', authenticate, checkRole('learner'), updateProgress);

/**
 * @swagger
 * /api/courses/{id}/progress:
 *   get:
 *     summary: Get current progress and exam status
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress data
 */
router.get('/:id/progress', authenticate, checkRole('learner'), getProgress);

/**
 * @swagger
 * /api/courses/{id}/exam:
 *   get:
 *     summary: Get exam questions (requires 100% content completion)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam questions (without answers)
 *       403:
 *         description: Content not completed
 */
router.get('/:id/exam', authenticate, checkRole('learner'), getExam);

/**
 * @swagger
 * /api/courses/{id}/exam:
 *   post:
 *     summary: Submit exam answers
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *                 description: Map of questionId to selectedOptionId or answer text
 *     responses:
 *       200:
 *         description: Exam results with score
 */
router.post('/:id/exam', authenticate, checkRole('learner'), submitExam);

/**
 * @swagger
 * /api/courses/{id}/complete:
 *   post:
 *     summary: Complete course and generate certificate (requires 100% content + 70% exam)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course completed, certificate generated
 *       400:
 *         description: Requirements not met
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 */
router.post('/:id/complete', authenticate, checkRole('learner'), completeCourse);

module.exports = router;
