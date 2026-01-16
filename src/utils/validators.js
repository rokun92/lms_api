/**
 * Validation Utilities
 * 
 * This module provides reusable validation functions for request data.
 * Helps maintain consistent validation logic across controllers.
 */

const { CONTENT_TYPES, QUESTION_TYPES, USER_ROLES, MIN_MCQ_OPTIONS } = require('../constants');

/**
 * Validate required fields are present in an object
 * 
 * @param {Object} data - The data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missingFields: string[]}}
 * 
 * @example
 * const result = validateRequiredFields(req.body, ['email', 'password']);
 * if (!result.valid) {
 *   return res.status(400).json({ message: `Missing fields: ${result.missingFields.join(', ')}` });
 * }
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => !data[field]);

    return {
        valid: missingFields.length === 0,
        missingFields
    };
}

/**
 * Validate email format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate user role
 * 
 * @param {string} role - Role to validate
 * @returns {{valid: boolean, message: string}}
 */
function validateUserRole(role) {
    const validRoles = Object.values(USER_ROLES);

    if (!validRoles.includes(role)) {
        return {
            valid: false,
            message: `Role must be one of: ${validRoles.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Validate course content type
 * 
 * @param {string} contentType - Content type to validate
 * @returns {{valid: boolean, message: string}}
 */
function validateContentType(contentType) {
    const validTypes = Object.values(CONTENT_TYPES);

    if (!validTypes.includes(contentType)) {
        return {
            valid: false,
            message: `Content type must be one of: ${validTypes.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Validate question type
 * 
 * @param {string} questionType - Question type to validate
 * @returns {{valid: boolean, message: string}}
 */
function validateQuestionType(questionType) {
    const validTypes = Object.values(QUESTION_TYPES);

    if (!validTypes.includes(questionType)) {
        return {
            valid: false,
            message: `Question type must be one of: ${validTypes.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Validate MCQ options
 * 
 * @param {Array} options - Array of MCQ options
 * @returns {{valid: boolean, message: string}}
 */
function validateMCQOptions(options) {
    // Check if options is an array
    if (!Array.isArray(options)) {
        return {
            valid: false,
            message: 'Options must be an array'
        };
    }

    // Check minimum number of options
    if (options.length < MIN_MCQ_OPTIONS) {
        return {
            valid: false,
            message: `MCQ questions must have at least ${MIN_MCQ_OPTIONS} options`
        };
    }

    // Check if at least one option is marked as correct
    const hasCorrectAnswer = options.some(opt => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
        return {
            valid: false,
            message: 'MCQ questions must have at least one correct option'
        };
    }

    // Validate each option has required fields
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (!opt.id || !opt.text) {
            return {
                valid: false,
                message: `Option ${i + 1} is missing required fields (id, text)`
            };
        }
    }

    return { valid: true };
}

/**
 * Validate UUID format
 * 
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if UUID format is valid
 */
function validateUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validate numeric value is within range
 * 
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {{valid: boolean, message: string}}
 */
function validateRange(value, min, max) {
    const num = Number(value);

    if (isNaN(num)) {
        return {
            valid: false,
            message: 'Value must be a number'
        };
    }

    if (num < min || num > max) {
        return {
            valid: false,
            message: `Value must be between ${min} and ${max}`
        };
    }

    return { valid: true };
}

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, message: string}}
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return {
            valid: false,
            message: 'Password is required'
        };
    }

    if (password.length < 6) {
        return {
            valid: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    return { valid: true };
}

/**
 * Sanitize string input (remove extra whitespace, trim)
 * 
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';

    return str.trim().replace(/\s+/g, ' ');
}

/**
 * Validate price value
 * 
 * @param {number|string} price - Price to validate
 * @returns {{valid: boolean, message: string}}
 */
function validatePrice(price) {
    const num = Number(price);

    if (isNaN(num)) {
        return {
            valid: false,
            message: 'Price must be a valid number'
        };
    }

    if (num < 0) {
        return {
            valid: false,
            message: 'Price cannot be negative'
        };
    }

    return { valid: true };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    validateRequiredFields,
    validateEmail,
    validateUserRole,
    validateContentType,
    validateQuestionType,
    validateMCQOptions,
    validateUUID,
    validateRange,
    validatePassword,
    validatePrice,
    sanitizeString
};
