const express = require('express');
const router = express.Router();
const { getAnalytics, suggestCategory } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnalytics);
router.post('/suggest-category', protect, suggestCategory);

module.exports = router;
