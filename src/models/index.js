const User = require('./user.model');
const Organization = require('./organization.model');
const Course = require('./course.model');
const Transaction = require('./transaction.model');
const Enrollment = require('./enrollment.model');

// User - Course (Instructor creates courses)
User.hasMany(Course, {
    foreignKey: 'instructorId',
    as: 'courses'
});
Course.belongsTo(User, {
    foreignKey: 'instructorId',
    as: 'instructor'
});

// User - Enrollment (Learners enroll in courses)
User.hasMany(Enrollment, {
    foreignKey: 'learnerId',
    as: 'enrollments'
});
Enrollment.belongsTo(User, {
    foreignKey: 'learnerId',
    as: 'learner'
});

// Course - Enrollment
Course.hasMany(Enrollment, {
    foreignKey: 'courseId',
    as: 'enrollments'
});
Enrollment.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
});



// Course - Transaction
Course.hasMany(Transaction, {
    foreignKey: 'relatedCourseId',
    as: 'transactions'
});
Transaction.belongsTo(Course, {
    foreignKey: 'relatedCourseId',
    as: 'relatedCourse'
});

module.exports = {
    User,
    Organization,
    Course,
    Transaction,
    Enrollment
};
