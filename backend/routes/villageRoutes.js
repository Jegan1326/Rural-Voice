const express = require('express');
const router = express.Router();
const { createVillage, getVillages } = require('../controllers/villageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createVillage)
    .get(getVillages);

module.exports = router;
