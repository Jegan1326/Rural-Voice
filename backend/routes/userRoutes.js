const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getUsers, banUser } = require('../controllers/userController');
const { getCertificate } = require('../controllers/certificateController');

router.get('/', protect, getUsers);
router.put('/:id/ban', protect, admin, banUser);
router.get('/:id/certificate', protect, getCertificate);

module.exports = router;
