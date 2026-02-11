const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
    try {
        const { village } = req.query;
        let query = {};

        if (village) {
            query.village = village;
        }

        const users = await User.find(query)
            .select('name points badges village')
            .sort({ points: -1 })
            .limit(10)
            .populate('village', 'name');

        res.json(users);
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const { village } = req.query;
        let query = {};

        if (village) {
            query.village = village;
        }

        const users = await User.find(query).select('name role village mobile isBanned');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const banUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isBanned = !user.isBanned; // Toggle ban
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}` });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getLeaderboard, getUsers, banUser };
