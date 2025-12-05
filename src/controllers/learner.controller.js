const { User, Course, Enrollment } = require('../models');

// Get home page data
const getHomeData = async (req, res, next) => {
    try {
        const learner = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        // Get enrolled courses with full details
        const enrolledCourses = await Enrollment.findAll({
            where: { learnerId: req.user.id },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['id', 'name', 'expertise']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Get all available courses (excluding already enrolled)
        const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

        // Build where clause - only add notIn filter if there are enrolled courses
        const whereClause = { status: 'active' };
        if (enrolledCourseIds.length > 0) {
            whereClause.id = { [require('sequelize').Op.notIn]: enrolledCourseIds };
        }

        const availableCourses = await Course.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'name', 'expertise']
                }
            ],
            attributes: { exclude: ['textContent', 'mcqContent', 'fileUrl'] },
            order: [['createdAt', 'DESC']],
            limit: 6
        });

        res.status(200).json({
            success: true,
            data: {
                learner: {
                    name: learner.name,
                    email: learner.email
                },
                stats: {
                    enrolledCourses: enrolledCourses.length
                },
                enrolledCourses: enrolledCourses,
                availableCourses: availableCourses
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get enrolled courses
const getEnrolledCourses = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { learnerId: req.user.id },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['id', 'name', 'expertise']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                count: enrollments.length,
                enrollments
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHomeData,
    getEnrolledCourses
};
