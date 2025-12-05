const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    purchaseCourse,
    getCourseContent,
    completeCourse
} = require('../controllers/course.controller');
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
 * /api/courses/{id}/complete:
 *   post:
 *     summary: Mark course complete (auto-generates certificate)
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
 *         description: Course already completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 */
router.post('/:id/complete', authenticate, checkRole('learner'), completeCourse);

module.exports = router;
