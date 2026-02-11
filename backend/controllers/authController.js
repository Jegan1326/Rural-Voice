const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT to embed in response
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { identifier, password } = req.body; // identifier can be mobile or email

        const user = await User.findOne({
            $or: [{ mobile: identifier }, { email: identifier }]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                village: user.village,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid mobile/email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, mobile, email, password, role, village, ward } = req.body;

        const userExists = await User.findOne({
            $or: [{ mobile }, { email }]
        });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists with this mobile or email');
        }

        const user = await User.create({
            name,
            mobile,
            email,
            password,
            role,
            village,
            ward,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                village: user.village,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                village: user.village,
                ward: user.ward,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { authUser, registerUser, getUserProfile };
