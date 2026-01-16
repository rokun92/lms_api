const { Course, User, Enrollment, Transaction } = require('../models');

// List all available courses
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.findAll({
            where: { status: 'active' },
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'name', 'expertise']
                }
            ],
            attributes: { exclude: ['textContent', 'mcqContent', 'fileUrl'] }, // Hide content until purchased
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                count: courses.length,
                courses
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get course details
const getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'name', 'bio', 'expertise']
                }
            ],
            attributes: { exclude: ['textContent', 'mcqContent', 'fileUrl'] }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is enrolled (if authenticated)
        let isEnrolled = false;
        if (req.user) {
            const enrollment = await Enrollment.findOne({
                where: {
                    learnerId: req.user.id,
                    courseId: id
                }
            });
            isEnrolled = !!enrollment;
        }

        res.status(200).json({
            success: true,
            data: {
                course,
                isEnrolled
            }
        });
    } catch (error) {
        next(error);
    }
};

// Purchase a course (free courses only - paid courses use Stripe)
const purchaseCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find course
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId: id
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        const isFree = parseFloat(course.price) === 0;

        // Only handle free courses here - paid courses use Stripe checkout
        if (!isFree) {
            return res.status(400).json({
                success: false,
                message: 'Please use Stripe checkout for paid courses. Use /api/payment/create-checkout-session'
            });
        }

        // Create enrollment for free course
        const enrollment = await Enrollment.create({
            learnerId: req.user.id,
            courseId: course.id
        });

        res.status(200).json({
            success: true,
            message: 'Enrolled successfully! You can now access the course content.',
            data: {
                enrollment,
                isFree: true
            }
        });
    } catch (error) {
        next(error);
    }
};

// Access course content (enrolled learners only)
const getCourseContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId: id
            }
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'You must purchase this course to access its content'
            });
        }

        // Get full course content
        const course = await Course.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'name', 'bio', 'expertise']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                course,
                enrollment: {
                    progress: enrollment.progress,
                    completed: enrollment.completed
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Mark course as complete - requires 100% content + passed exam
const completeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId: id
            },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        if (enrollment.completed) {
            return res.status(200).json({
                success: true,
                message: 'Course already completed',
                data: {
                    enrollment,
                    certificateUrl: enrollment.certificateUrl
                }
            });
        }

        // NEW: Check content completion (100% required)
        if (enrollment.contentProgress < 100) {
            return res.status(400).json({
                success: false,
                message: `You must complete all course content first. Current progress: ${enrollment.contentProgress}%`,
                data: {
                    contentProgress: enrollment.contentProgress,
                    required: 100
                }
            });
        }

        // NEW: Check exam passed (70% required)
        if (!enrollment.examPassed) {
            return res.status(400).json({
                success: false,
                message: `You must pass the exam with at least ${enrollment.course.passingScore || 70}% to complete the course`,
                data: {
                    examPassed: enrollment.examPassed,
                    examScore: enrollment.examScore,
                    examAttempts: enrollment.examAttemptCount,
                    required: enrollment.course.passingScore || 70
                }
            });
        }

        // All requirements met - mark as complete
        enrollment.progress = 100;
        enrollment.completed = true;
        enrollment.completedAt = new Date();

        // Generate Certificate
        try {
            const { generateCertificate } = require('../utils/certificate');
            const { sendEmail } = require('../utils/email');
            const { cloudinary } = require('../config/cloudinary');
            const stream = require('stream');

            const learnerName = req.user.name;
            const courseName = enrollment.course.title;
            const instructorName = enrollment.course.instructor.name;

            console.log(`Generating certificate for ${learnerName} - ${courseName}`);
            const pdfBuffer = await generateCertificate(learnerName, courseName, instructorName);

            // Upload to Cloudinary
            const uploadStream = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'lms-certificates',
                            resource_type: 'image', // Use image to allow PDF preview/thumbnails if supported, or 'raw'
                            format: 'pdf',
                            public_id: `certificate_${enrollment.id}_${Date.now()}`
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    const bufferStream = new stream.PassThrough();
                    bufferStream.end(buffer);
                    bufferStream.pipe(uploadStream);
                });
            };

            console.log('Uploading certificate to Cloudinary...');
            const result = await uploadStream(pdfBuffer);
            enrollment.certificateUrl = result.secure_url;
            console.log('Certificate uploaded:', result.secure_url);

            // Send Email
            console.log('Sending certificate email...');
            await sendEmail(
                req.user.email,
                `Certificate of Completion: ${courseName}`,
                `Congratulations ${learnerName}!\n\nYou have successfully completed the course "${courseName}".\n\nPlease find your certificate attached.\n\nYou can also view and download it from your dashboard.`,
                [
                    {
                        filename: `${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`,
                        content: pdfBuffer
                    }
                ]
            );
        } catch (err) {
            console.error('Error generating/sending certificate:', err);
            // Don't fail the request if certificate fails, just log it
        }

        await enrollment.save();

        res.status(200).json({
            success: true,
            message: 'Congratulations! Course completed successfully. Certificate generated and sent to your email.',
            data: {
                enrollment,
                certificateUrl: enrollment.certificateUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    purchaseCourse,
    getCourseContent,
    completeCourse
};
