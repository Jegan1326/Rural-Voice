const Village = require('../models/Village');

// @desc    Create a new village
// @route   POST /api/villages
// @access  Private/Admin
const createVillage = async (req, res, next) => {
    try {
        const { name, district, state, wards } = req.body;

        const villageExists = await Village.findOne({ name });

        if (villageExists) {
            res.status(400);
            throw new Error('Village already exists');
        }

        const village = await Village.create({
            name,
            district,
            state,
            wards,
            admin_id: req.user._id,
        });

        res.status(201).json(village);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all villages
// @route   GET /api/villages
// @access  Public
const getVillages = async (req, res, next) => {
    try {
        const { district } = req.query;
        const query = district ? { district } : {};
        const villages = await Village.find(query);
        res.json(villages);
    } catch (error) {
        next(error);
    }
};

module.exports = { createVillage, getVillages };
