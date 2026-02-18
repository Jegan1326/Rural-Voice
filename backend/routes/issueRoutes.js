const express = require('express');
const router = express.Router();
const { createIssue, getIssues, getIssueById, updateIssueStatus, voteIssue, addComment, assignIssue, replyToComment, addProgressUpdate, getMyVillageIssues } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
    .post(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'voice', maxCount: 1 }]), createIssue)
    .get(getIssues);

router.get('/my-village', protect, getMyVillageIssues);

router.route('/:id')
    .get(getIssueById);

router.route('/:id/status').put(protect, updateIssueStatus);
router.route('/:id/assign').put(protect, assignIssue);
router.route('/:id/progress').post(protect, upload.fields([{ name: 'image', maxCount: 1 }]), addProgressUpdate);
router.route('/:id/vote').put(protect, voteIssue);
router.route('/:id/comments').post(protect, addComment);
router.route('/:id/comments/:commentId/reply').post(protect, replyToComment);

module.exports = router;
