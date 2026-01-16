const { Course, Enrollment, Question, ExamAttempt } = require('../models');

/**
 * Update content progress
 * For video/audio: accepts current playback position (seconds)
 * For text: accepts time spent reading (seconds)
 */
const updateProgress = async (req, res, next) => {
    try {
        const { id: courseId } = req.params;
        const { currentPositionSeconds, timeSpentSeconds } = req.body;

        // Find enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId
            },
            include: [{
                model: Course,
                as: 'course'
            }]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        const course = enrollment.course;

        // Calculate progress based on content type
        let contentProgress = enrollment.contentProgress;

        if (course.contentType === 'video' || course.contentType === 'audio') {
            const { totalDurationSeconds } = req.body;
            let duration = Number(course.contentDurationSeconds);
            let position = Number(currentPositionSeconds);

            // If duration is missing in DB but provided by frontend (HTML5 media element knows it), use and save it
            if ((!duration || duration === 0) && Number.isFinite(totalDurationSeconds) && totalDurationSeconds > 0) {
                duration = Number(totalDurationSeconds);
                // Update course asynchronously to fix data for future
                Course.update({ contentDurationSeconds: duration }, { where: { id: course.id } }).catch(console.error);
            }

            // Handle ms → seconds mismatch
            if (position > duration * 2) {
                position = position / 1000;
            }

            if (Number.isFinite(duration) && duration > 0 && Number.isFinite(position)) {
                const calculatedProgress = Math.round((position / duration) * 100);

                // Never allow progress to decrease
                contentProgress = Math.min(
                    100,
                    Math.max(enrollment.contentProgress || 0, calculatedProgress)
                );
            }
        } else if (course.contentType === 'text') {
            // Accumulate time spent
            const newTimeSpent =
                (enrollment.timeSpentSeconds || 0) + (timeSpentSeconds || 0);
            enrollment.timeSpentSeconds = newTimeSpent;

            let requiredSeconds;
            if (course.requiredReadingMinutes) {
                requiredSeconds = course.requiredReadingMinutes * 60;
            }
            // 2️⃣ Calculate from word count (200 WPM)
            else if (course.textContent) {
                const wordCount = course.textContent.trim().split(/\s+/).length;
                requiredSeconds = Math.ceil((wordCount / 200) * 60);

                // Minimum 10 seconds for very short text
                requiredSeconds = Math.max(requiredSeconds, 10);
            }
            // 3️⃣ Fallback
            else {
                requiredSeconds = 10;
            }

            // Calculate progress
            contentProgress = Math.min(
                100,
                Math.round((newTimeSpent / requiredSeconds) * 100)
            );
        }

        enrollment.contentProgress = contentProgress;

        // Mark content as completed if 100%
        if (contentProgress >= 100 && !enrollment.contentCompletedAt) {
            enrollment.contentCompletedAt = new Date();
        }

        // Update overall progress (content completion is part of it)
        enrollment.progress = contentProgress;

        await enrollment.save();

        res.status(200).json({
            success: true,
            message: 'Progress updated',
            data: {
                contentProgress: enrollment.contentProgress,
                timeSpentSeconds: enrollment.timeSpentSeconds,
                contentCompleted: enrollment.contentProgress >= 100,
                contentCompletedAt: enrollment.contentCompletedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get student's current progress for a course
 */
const getProgress = async (req, res, next) => {
    try {
        const { id: courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId
            },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['contentType', 'contentDurationSeconds', 'requiredReadingMinutes', 'passingScore']
            }, {
                model: ExamAttempt,
                as: 'examAttempts',
                order: [['attemptNumber', 'DESC']],
                limit: 1
            }]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Get question count
        const questionCount = await Question.count({ where: { courseId } });

        // Calculate flags
        const contentCompleted = enrollment.contentProgress >= 100;
        const hasQuestions = questionCount > 0;
        const canTakeExam = contentCompleted;

        // Can get certificate if:
        // - Content is 100% complete AND
        // - Either no exam exists OR exam is passed
        const canGetCertificate = contentCompleted && (!hasQuestions || enrollment.examPassed);

        res.status(200).json({
            success: true,
            data: {
                contentProgress: enrollment.contentProgress,
                contentCompleted,
                contentCompletedAt: enrollment.contentCompletedAt,
                timeSpentSeconds: enrollment.timeSpentSeconds,
                examPassed: enrollment.examPassed,
                examScore: enrollment.examScore,
                examAttemptCount: enrollment.examAttemptCount,
                lastExamAttempt: enrollment.examAttempts?.[0] || null,
                hasQuestions,
                questionCount,
                passingScore: enrollment.course.passingScore,
                canTakeExam,
                canGetCertificate
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get exam questions for a course (without correct answers)
 */
const getExam = async (req, res, next) => {
    try {
        const { id: courseId } = req.params;

        // Verify enrollment and content completion
        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        if (enrollment.contentProgress < 100) {
            return res.status(403).json({
                success: false,
                message: 'You must complete the course content before taking the exam'
            });
        }

        // Get questions (hide correct answers)
        const questions = await Question.findAll({
            where: { courseId },
            attributes: ['id', 'questionText', 'questionType', 'options', 'points'],
            order: [['order', 'ASC']]
        });

        // Remove isCorrect from options
        const sanitizedQuestions = questions.map(q => {
            const questionData = q.toJSON();
            if (questionData.options) {
                questionData.options = questionData.options.map(opt => ({
                    id: opt.id,
                    text: opt.text
                }));
            }
            return questionData;
        });

        // Get course info
        const course = await Course.findByPk(courseId, {
            attributes: ['passingScore']
        });

        res.status(200).json({
            success: true,
            data: {
                questions: sanitizedQuestions,
                questionCount: sanitizedQuestions.length,
                passingScore: course.passingScore,
                attemptNumber: enrollment.examAttemptCount + 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Submit exam attempt
 */
const submitExam = async (req, res, next) => {
    try {
        const { id: courseId } = req.params;
        const { answers } = req.body; // { questionId: selectedOptionId/answer }

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Please provide answers object'
            });
        }

        // Verify enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                learnerId: req.user.id,
                courseId
            },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['passingScore']
            }]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        if (enrollment.contentProgress < 100) {
            return res.status(403).json({
                success: false,
                message: 'You must complete the course content before taking the exam'
            });
        }

        // Get all questions
        const questions = await Question.findAll({
            where: { courseId }
        });

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'This course has no exam questions'
            });
        }

        // Calculate score
        let pointsEarned = 0;
        let totalPoints = 0;

        questions.forEach(q => {
            totalPoints += q.points;
            const studentAnswer = answers[q.id];

            if (q.questionType === 'mcq') {
                // Check if selected option is correct
                const selectedOption = q.options?.find(opt => opt.id === studentAnswer);
                if (selectedOption && selectedOption.isCorrect) {
                    pointsEarned += q.points;
                }
            } else if (q.questionType === 'quiz') {
                // Case-insensitive comparison for quiz
                if (studentAnswer && q.correctAnswer &&
                    studentAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                    pointsEarned += q.points;
                }
            }
        });

        const score = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
        const passed = score >= enrollment.course.passingScore;

        // Create exam attempt record
        const attemptNumber = enrollment.examAttemptCount + 1;
        const examAttempt = await ExamAttempt.create({
            enrollmentId: enrollment.id,
            answers,
            score,
            passed,
            attemptNumber,
            pointsEarned,
            totalPoints
        });

        // Update enrollment
        enrollment.examAttemptCount = attemptNumber;
        if (passed && !enrollment.examPassed) {
            enrollment.examPassed = true;
            enrollment.examScore = score;
        }
        await enrollment.save();

        res.status(200).json({
            success: true,
            message: passed ? 'Congratulations! You passed the exam!' : 'You did not pass. You can try again.',
            data: {
                score: score.toFixed(2),
                passed,
                pointsEarned,
                totalPoints,
                passingScore: enrollment.course.passingScore,
                attemptNumber,
                canGetCertificate: enrollment.contentProgress >= 100 && passed
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProgress,
    getProgress,
    getExam,
    submitExam
};
