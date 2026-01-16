/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the application.
 * Centralizing constants makes the codebase more maintainable and easier to configure.
 */

// ============================================================================
// COURSE CONSTANTS
// ============================================================================

/**
 * Valid content types for courses
 */
const CONTENT_TYPES = {
    TEXT: 'text',
    VIDEO: 'video',
    AUDIO: 'audio'
};

/**
 * Course status values
 */
const COURSE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

/**
 * Default passing score percentage for exams
 */
const DEFAULT_PASSING_SCORE = 70;

/**
 * Default course price in BDT (if not specified)
 */
const DEFAULT_COURSE_PRICE = 100;

// ============================================================================
// PROGRESS TRACKING CONSTANTS
// ============================================================================

/**
 * Average reading speed in words per minute
 * Used to calculate required reading time for text content
 */
const READING_SPEED_WPM = 200;

/**
 * Minimum required reading time in seconds
 * Applied to very short text content
 */
const MIN_READING_TIME_SECONDS = 10;

/**
 * Progress percentage thresholds
 */
const PROGRESS = {
    MIN: 0,
    MAX: 100,
    COMPLETE: 100
};

/**
 * Milliseconds to seconds conversion factor
 * Used when frontend sends time in milliseconds instead of seconds
 */
const MS_TO_SECONDS_THRESHOLD = 2;

// ============================================================================
// EXAM CONSTANTS
// ============================================================================

/**
 * Question types for exams
 */
const QUESTION_TYPES = {
    MCQ: 'mcq',      // Multiple Choice Question
    QUIZ: 'quiz'     // Short Answer/Fill in the blank
};

/**
 * Minimum number of options required for MCQ questions
 */
const MIN_MCQ_OPTIONS = 2;

/**
 * Default points per question
 */
const DEFAULT_QUESTION_POINTS = 1;

// ============================================================================
// USER CONSTANTS
// ============================================================================

/**
 * User roles in the system
 */
const USER_ROLES = {
    INSTRUCTOR: 'instructor',
    LEARNER: 'learner'
};

/**
 * BCrypt salt rounds for password hashing
 */
const BCRYPT_SALT_ROUNDS = 10;

// ============================================================================
// PAYMENT CONSTANTS
// ============================================================================

/**
 * Transaction types
 */
const TRANSACTION_TYPES = {
    COURSE_PURCHASE: 'course_purchase',
    WITHDRAWAL: 'withdrawal',
    REFUND: 'refund'
};

/**
 * Transaction status values
 */
const TRANSACTION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

/**
 * Stripe currency code for Bangladesh Taka
 */
const CURRENCY_BDT = 'bdt';

/**
 * USD to BDT conversion rate (approximate)
 * Used for Stripe payments (Stripe requires minimum charge in USD equivalent)
 */
const USD_TO_BDT_RATE = 120;

/**
 * Minimum Stripe charge in BDT (approximately $0.50 USD)
 */
const MIN_STRIPE_CHARGE_BDT = 60;

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

/**
 * Default number of items per page for paginated results
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Maximum number of items per page
 */
const MAX_PAGE_SIZE = 100;

/**
 * Default limit for "recent items" queries
 */
const RECENT_ITEMS_LIMIT = 6;

// ============================================================================
// FILE UPLOAD CONSTANTS
// ============================================================================

/**
 * Cloudinary folder for certificate uploads
 */
const CLOUDINARY_CERTIFICATE_FOLDER = 'lms-certificates';

/**
 * Cloudinary resource type for certificates
 */
const CLOUDINARY_CERTIFICATE_RESOURCE_TYPE = 'image';

/**
 * Certificate file format
 */
const CERTIFICATE_FORMAT = 'pdf';

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

/**
 * Common HTTP status codes used in the application
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Standardized error messages
 */
const ERROR_MESSAGES = {
    // Authentication
    AUTH_TOKEN_MISSING: 'No token provided. Please login first.',
    AUTH_TOKEN_INVALID: 'Invalid or expired token. Please login again.',
    AUTH_USER_NOT_FOUND: 'User not found. Please login again.',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',

    // Authorization
    AUTHZ_INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',

    // Validation
    VALIDATION_MISSING_FIELDS: 'Required fields are missing',
    VALIDATION_INVALID_FORMAT: 'Invalid data format',

    // Resources
    RESOURCE_NOT_FOUND: 'Resource not found',
    RESOURCE_ALREADY_EXISTS: 'Resource already exists',

    // Enrollment
    ENROLLMENT_NOT_FOUND: 'You are not enrolled in this course',
    ENROLLMENT_ALREADY_EXISTS: 'You are already enrolled in this course',
    ENROLLMENT_CONTENT_INCOMPLETE: 'You must complete all course content first',
    ENROLLMENT_EXAM_NOT_PASSED: 'You must pass the exam to complete the course',

    // Course
    COURSE_NOT_FOUND: 'Course not found',
    COURSE_ACCESS_DENIED: 'You must purchase this course to access its content',

    // Exam
    EXAM_NO_QUESTIONS: 'This course has no exam questions',
    EXAM_CONTENT_NOT_COMPLETE: 'You must complete the course content before taking the exam',

    // Payment
    PAYMENT_SESSION_NOT_FOUND: 'Payment session not found',
    PAYMENT_USE_STRIPE: 'Please use Stripe checkout for paid courses'
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
    // Authentication
    AUTH_REGISTER_SUCCESS: 'User registered successfully',
    AUTH_LOGIN_SUCCESS: 'Login successful',

    // Course
    COURSE_CREATED: 'Course uploaded successfully',
    COURSE_UPDATED: 'Course updated successfully',
    COURSE_DELETED: 'Course deleted successfully',
    COURSE_COMPLETED: 'Congratulations! Course completed successfully. Certificate generated and sent to your email.',

    // Enrollment
    ENROLLMENT_SUCCESS: 'Enrolled successfully! You can now access the course content.',

    // Progress
    PROGRESS_UPDATED: 'Progress updated successfully',

    // Exam
    EXAM_PASSED: 'Congratulations! You passed the exam!',
    EXAM_FAILED: 'You did not pass. You can try again.',
    QUESTION_ADDED: 'Question added successfully',
    QUESTION_UPDATED: 'Question updated successfully',
    QUESTION_DELETED: 'Question deleted successfully',

    // Profile
    PROFILE_UPDATED: 'Profile updated successfully',

    // Transaction
    TRANSACTION_CREATED: 'Transaction created successfully',
    TRANSACTION_VALIDATED: 'Transaction validated successfully'
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Course
    CONTENT_TYPES,
    COURSE_STATUS,
    DEFAULT_PASSING_SCORE,
    DEFAULT_COURSE_PRICE,

    // Progress
    READING_SPEED_WPM,
    MIN_READING_TIME_SECONDS,
    PROGRESS,
    MS_TO_SECONDS_THRESHOLD,

    // Exam
    QUESTION_TYPES,
    MIN_MCQ_OPTIONS,
    DEFAULT_QUESTION_POINTS,

    // User
    USER_ROLES,
    BCRYPT_SALT_ROUNDS,

    // Payment
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    CURRENCY_BDT,
    USD_TO_BDT_RATE,
    MIN_STRIPE_CHARGE_BDT,

    // Pagination
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    RECENT_ITEMS_LIMIT,

    // File Upload
    CLOUDINARY_CERTIFICATE_FOLDER,
    CLOUDINARY_CERTIFICATE_RESOURCE_TYPE,
    CERTIFICATE_FORMAT,

    // HTTP
    HTTP_STATUS,

    // Messages
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};
