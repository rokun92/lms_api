const { User, Course } = require('../models');
const {
    HTTP_STATUS,
    SUCCESS_MESSAGES,
    CONTENT_TYPES,
    DEFAULT_COURSE_PRICE
} = require('../constants');
const {
    validateRequiredFields,
    validateContentType
} = require('../utils/validators');


const uploadCourse = async (req, res, next) => {
    try {
        const { title, description, contentType, textContent, price } = req.body;
        const instructorId = req.user.id;

        // Validate required fields
        const requiredValidation = validateRequiredFields(req.body, ['title', 'description', 'contentType']);
        if (!requiredValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${requiredValidation.missingFields.join(', ')}`
            });
        }

        // Validate content type
        const contentTypeValidation = validateContentType(contentType);
        if (!contentTypeValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: contentTypeValidation.message
            });
        }

        // Prepare course data
        const courseData = {
            title,
            description,
            contentType,
            instructorId,
            price: price || process.env.COURSE_PRICE || DEFAULT_COURSE_PRICE
        };

        // Validate and add content based on type
        if (contentType === CONTENT_TYPES.TEXT) {
            if (!textContent) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Text content is required for text type courses'
                });
            }
            courseData.textContent = textContent;
        } else if (contentType === CONTENT_TYPES.VIDEO || contentType === CONTENT_TYPES.AUDIO) {
            if (!req.file) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `File upload is required for ${contentType} type courses`
                });
            }
            courseData.fileUrl = req.file.path; // Cloudinary URL
            courseData.filePublicId = req.file.filename; // Cloudinary public ID. which will be not seen cause cloudinary don't support
        }

        // Create course in database
        const course = await Course.create(courseData);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.COURSE_CREATED,
            data: { course }
        });
    } catch (error) {
        next(error);
    }
};


const getMyCourses = async (req, res, next) => {
    try {
        const courses = await Course.findAll({
            where: { instructorId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.status(HTTP_STATUS.OK).json({
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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { user: instructor }
        });
    } catch (error) {
        next(error);
    }
};


const updateProfile = async (req, res, next) => {
    try {
        const { name, bio, expertise } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        if (expertise) updateData.expertise = expertise;

        // Update user in database
        await User.update(updateData, {
            where: { id: req.user.id }
        });

        // Fetch updated user data
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.PROFILE_UPDATED,
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    uploadCourse,
    getMyCourses,
    getProfile,
    updateProfile
};
