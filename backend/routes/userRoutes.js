const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getLeaderboard, getUsers, banUser } = require('../controllers/userController');
const { getCertificate } = require('../controllers/certificateController');

router.get('/leaderboard', getLeaderboard);
router.get('/', protect, getUsers);
router.put('/:id/ban', protect, admin, banUser);
router.get('/:id/certificate', protect, getCertificate);

module.exports = router;
