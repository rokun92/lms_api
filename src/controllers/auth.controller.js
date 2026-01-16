/**
 * Authentication Controller
 * 
 * Handles user authentication operations including registration, login, and profile retrieval.
 * Supports both instructor and learner roles with role-specific data.
 */

const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const {
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    USER_ROLES
} = require('../constants');
const {
    validateRequiredFields,
    validateEmail,
    validateUserRole,
    validatePassword
} = require('../utils/validators');

/**
 * Register a new user (Instructor or Learner)
 * 
 * @route POST /api/auth/register
 * @access Public
 * 
 * @param {Object} req.body - Registration data
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (min 6 characters)
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.role - User role ('instructor' or 'learner')
 * @param {string} [req.body.bio] - Instructor bio (optional, instructor only)
 * @param {string} [req.body.expertise] - Instructor expertise (optional, instructor only)
 * 
 * @returns {Object} 201 - User created successfully with JWT token
 * @returns {Object} 400 - Validation error or user already exists
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name, role, bio, expertise } = req.body;

        // Validate required fields
        const requiredValidation = validateRequiredFields(req.body, ['email', 'password', 'name', 'role']);
        if (!requiredValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${requiredValidation.missingFields.join(', ')}`
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Validate role
        const roleValidation = validateUserRole(role);
        if (!roleValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: roleValidation.message
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Prepare user data
        const userData = {
            email,
            password,
            name,
            role
        };

        // Add instructor-specific fields if role is instructor
        if (role === USER_ROLES.INSTRUCTOR) {
            userData.bio = bio || '';
            userData.expertise = expertise || '';
        }

        // Create user (password will be hashed by model hook)
        const user = await User.create(userData);

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Return success response
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.AUTH_REGISTER_SUCCESS,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} 200 - Login successful with JWT token
 * @returns {Object} 400 - Missing credentials
 * @returns {Object} 401 - Invalid credentials
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        const requiredValidation = validateRequiredFields(req.body, ['email', 'password']);
        if (!requiredValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${requiredValidation.missingFields.join(', ')}`
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Return success response
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.AUTH_LOGIN_SUCCESS,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * 
 * @route GET /api/auth/profile
 * @access Private
 * 
 * @param {Object} req.user - Authenticated user (set by auth middleware)
 * 
 * @returns {Object} 200 - User profile data
 * @returns {Object} 401 - Unauthorized
 */
const getProfile = async (req, res, next) => {
    try {
        // Fetch user profile (password excluded)
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    register,
    login,
    getProfile
};
