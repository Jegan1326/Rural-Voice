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

module.exports = { getUsers, banUser };
