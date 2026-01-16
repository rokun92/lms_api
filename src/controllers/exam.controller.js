const { Question, Course } = require('../models');

/**
 * Add a question to a course
 */
const addQuestion = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { questionText, questionType, options, correctAnswer, points } = req.body;

        // Verify course exists and belongs to instructor
        const course = await Course.findOne({
            where: { id: courseId, instructorId: req.user.id }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or you do not have permission'
            });
        }

        // Validation
        if (!questionText || !questionType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide questionText and questionType'
            });
        }

        if (!['mcq', 'quiz'].includes(questionType)) {
            return res.status(400).json({
                success: false,
                message: 'questionType must be "mcq" or "quiz"'
            });
        }

        // MCQ validation
        if (questionType === 'mcq') {
            if (!options || !Array.isArray(options) || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'MCQ questions must have at least 2 options'
                });
            }

            // Ensure at least one correct answer
            const hasCorrect = options.some(opt => opt.isCorrect === true);
            if (!hasCorrect) {
                return res.status(400).json({
                    success: false,
                    message: 'MCQ questions must have at least one correct option'
                });
            }
        }

        // Quiz validation
        if (questionType === 'quiz' && !correctAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Quiz questions must have a correctAnswer'
            });
        }

        // Get next order number
        const maxOrder = await Question.max('order', { where: { courseId } }) || 0;

        const question = await Question.create({
            courseId,
            questionText,
            questionType,
            options: questionType === 'mcq' ? options : null,
            correctAnswer: questionType === 'quiz' ? correctAnswer : null,
            points: points || 1,
            order: maxOrder + 1
        });

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: { question }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all questions for a course (instructor view - includes answers)
 */
const getQuestions = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Verify course exists and belongs to instructor
        const course = await Course.findOne({
            where: { id: courseId, instructorId: req.user.id }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or you do not have permission'
            });
        }

        const questions = await Question.findAll({
            where: { courseId },
            order: [['order', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: {
                count: questions.length,
                questions
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a question
 */
const updateQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { questionText, questionType, options, correctAnswer, points, order } = req.body;

        // Find question and verify ownership
        const question = await Question.findByPk(questionId, {
            include: [{
                model: Course,
                as: 'course',
                attributes: ['instructorId']
            }]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (question.course.instructorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this question'
            });
        }

        // Update fields
        if (questionText) question.questionText = questionText;
        if (questionType) question.questionType = questionType;
        if (options) question.options = options;
        if (correctAnswer) question.correctAnswer = correctAnswer;
        if (points !== undefined) question.points = points;
        if (order !== undefined) question.order = order;

        await question.save();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: { question }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a question
 */
const deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        // Find question and verify ownership
        const question = await Question.findByPk(questionId, {
            include: [{
                model: Course,
                as: 'course',
                attributes: ['instructorId']
            }]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (question.course.instructorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this question'
            });
        }

        await question.destroy();

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion
};
