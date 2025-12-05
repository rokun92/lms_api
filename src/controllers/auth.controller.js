const { User } = require('../models');
const { generateToken } = require('../config/jwt');

// Register new user (Instructor or Learner)
const register = async (req, res, next) => {
    try {
        const { email, password, name, role, bio, expertise } = req.body;

        // Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, name, and role'
            });
        }

        if (!['instructor', 'learner'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either "instructor" or "learner"'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const userData = {
            email,
            password,
            name,
            role
        };

        if (role === 'instructor') {
            userData.bio = bio || '';
            userData.expertise = expertise || '';
        }

        const user = await User.create(userData);

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
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

// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.status(200).json({
            success: true,
            message: 'Login successful',
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

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile
};
