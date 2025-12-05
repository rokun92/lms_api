const express = require('express');
const router = express.Router();
const {
    getHomeData,
    getEnrolledCourses
} = require('../controllers/learner.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Learner
 *   description: Learner dashboard and course management
 */

// All routes require authentication and learner role
router.use(authenticate);
router.use(checkRole('learner'));

/**
 * @swagger
 * /api/learner/home:
 *   get:
 *     summary: Get home page data (courses, enrollments)
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home page data with available courses and enrollments
 *       401:
 *         description: Unauthorized
 */
router.get('/home', getHomeData);

/**
 * @swagger
 * /api/learner/enrolled-courses:
 *   get:
 *     summary: Get enrolled courses with progress
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses with progress
 *       401:
 *         description: Unauthorized
 */
router.get('/enrolled-courses', getEnrolledCourses);

module.exports = router;
