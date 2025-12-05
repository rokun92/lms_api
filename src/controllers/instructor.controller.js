const { User, Course } = require('../models');

// Upload new course
const uploadCourse = async (req, res, next) => {
    try {
        const { title, description, contentType, textContent, mcqContent, price } = req.body;
        const instructorId = req.user.id;

        // Validation
        if (!title || !description || !contentType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and contentType'
            });
        }

        if (!['text', 'video', 'audio', 'mcq'].includes(contentType)) {
            return res.status(400).json({
                success: false,
                message: 'Content type must be: text, video, audio, or mcq'
            });
        }

        // Prepare course data
        const courseData = {
            title,
            description,
            contentType,
            instructorId,
            price: price || process.env.COURSE_PRICE || 100
        };

        // Handle different content types
        if (contentType === 'text') {
            if (!textContent) {
                return res.status(400).json({
                    success: false,
                    message: 'Text content is required for text type courses'
                });
            }
            courseData.textContent = textContent;
        } else if (contentType === 'mcq') {
            if (!mcqContent) {
                return res.status(400).json({
                    success: false,
                    message: 'MCQ content is required for MCQ type courses'
                });
            }
            courseData.mcqContent = mcqContent;
        } else if (contentType === 'video' || contentType === 'audio') {
            // File should be uploaded via multer
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: `File upload is required for ${contentType} type courses`
                });
            }
            courseData.fileUrl = req.file.path; // Cloudinary URL
            courseData.filePublicId = req.file.filename; // Cloudinary public ID
        }

        // Create course
        const course = await Course.create(courseData);

        res.status(201).json({
            success: true,
            message: 'Course uploaded successfully.',
            data: {
                course
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get instructor's courses
const getMyCourses = async (req, res, next) => {
    try {
        const courses = await Course.findAll({
            where: { instructorId: req.user.id },
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

// Get instructor profile
const getProfile = async (req, res, next) => {
    try {
        const instructor = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id', 'title', 'status', 'createdAt']
                }
            ]
        });

        const userData = instructor.toJSON();

        res.status(200).json({
            success: true,
            data: { user: userData }
        });
    } catch (error) {
        next(error);
    }
};

// Update instructor profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, bio, expertise } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        if (expertise) updateData.expertise = expertise;

        await User.update(updateData, {
            where: { id: req.user.id }
        });

        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
};

// Get instructor's transaction history
// Get instructor's transaction history (Deprecated - use payment controller)
const getTransactionHistory = async (req, res, next) => {
    try {
        return res.status(404).json({
            success: false,
            message: 'This endpoint is deprecated. Use /api/payment/instructor/earnings'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadCourse,
    getMyCourses,
    getProfile,
    updateProfile,
    getTransactionHistory
};
