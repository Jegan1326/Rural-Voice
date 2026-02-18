const Issue = require('../models/Issue');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/twilioService');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res, next) => {
    try {
        const { title, description, category, village, villageName, location } = req.body;
        console.log('--- Create Issue Request ---');
        console.log('Title:', title);
        console.log('Body Village ID:', village);
        console.log('User Village ID (from req.user):', req.user?.village);
        console.log('Village Name:', villageName);

        let imageUrl = '';
        let voiceUrl = '';
        // ... (rest of file)

        if (req.files) {
            if (req.files.image) {
                imageUrl = req.files.image[0].path;
                // Convert local path to URL if not using Cloudinary
                if (!imageUrl.startsWith('http')) {
                    imageUrl = `/uploads/${req.files.image[0].filename}`;
                }
            }
            if (req.files.voice) {
                voiceUrl = req.files.voice[0].path;
                // Convert local path to URL if not using Cloudinary
                if (!voiceUrl.startsWith('http')) {
                    voiceUrl = `/uploads/${req.files.voice[0].filename}`;
                }
            }
        }

        const issue = await Issue.create({
            title,
            description,
            category,
            village: village || req.user.village,
            villageName: villageName || req.user.villageName,
            imageUrl,
            voiceUrl,
            location: location ? JSON.parse(location) : undefined,
            reportedBy: req.user._id,
        });

        // Award points for reporting an issue
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

        const populatedIssue = await Issue.findById(issue._id)
            .populate('reportedBy', 'name')
            .populate('village', 'name');

        const io = req.app.get('io');
        io.to(village).emit('newIssue', populatedIssue);

        // Send SMS to Reporter
        if (req.user.mobile) {
            await sendSMS(req.user.mobile, `Rural Voice: Your issue "${title}" has been reported successfully. Thank you!`);
        }

        res.status(201).json(issue);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res, next) => {
    try {
        const { village, category, timeRange, sort } = req.query;
        let query = {};

        if (village) {
            query.village = village;
        }

        if (category) {
            query.category = category;
        }

        if (timeRange === 'weekly') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        }

        let issuesQuery = Issue.find(query)
            .populate('reportedBy', 'name')
            .populate('village', 'name')
            .populate('comments.user', 'name')
            .populate('comments.replies.user', 'name');

        if (sort === 'top') {
            // Sort by votes count descending
            // Since votes is an array of IDs, we need to sort by array length.
            // Standard sort() can't do this easily without aggregation.
            // For MVP simplicity, let's just fetch and sort in memory if the dataset is small,
            // OR better: use aggregation which is more scalable.
            // Let's stick to standard find() for consistency with existing codebase unless aggregation is needed.
            // Wait, standard sort on virtuals or array length is tricky.
            // Let's us a simple .sort({ 'votes' : -1 }) might not work as intended for array length.
            // Actually, the best way for Mongoose/Mongo to sort by array size is to have a `votesCount` field
            // or use aggregate.
            // Given I don't want to migrate schema now, I'll allow sorting by `createdAt` desc default,
            // and if `sort=top`, I will sort in memory after fetch (efficient enough for village-level scale).
        } else {
            issuesQuery = issuesQuery.sort({ createdAt: -1 });
        }

        let issues = await issuesQuery;

        if (sort === 'top') {
            issues.sort((a, b) => b.votes.length - a.votes.length);
            if (req.query.limit) {
                issues = issues.slice(0, parseInt(req.query.limit));
            }
        }

        res.json(issues);
    } catch (error) {
        next(error);
    }
};

// @desc    Get issue by I
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name')
            .populate('village', 'name')
            .populate('comments.user', 'name');

        if (issue) {
            res.json(issue);
        } else {
            res.status(404);
            throw new Error('Issue not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private/Admin/Coordinator
const updateIssueStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            if (req.user.role === 'Admin' || req.user.role === 'SuperAdmin' || req.user.role === 'Coordinator') {
                issue.status = status;
                if (status === 'Resolved' && issue.status !== 'Resolved') {
                    issue.resolvedAt = Date.now();
                    // Award points to the reporter
                    await User.findByIdAndUpdate(issue.reportedBy, { $inc: { points: 50 } });
                }
                const updatedIssue = await issue.save();

                const io = req.app.get('io');
                io.to(issue.village.toString()).emit('issueUpdated', updatedIssue);

                // Send Email Notification
                if (status === 'Resolved' && updatedIssue.reportedBy) {
                    try {
                        const user = await User.findById(updatedIssue.reportedBy);
                        if (user && user.email) {
                            await sendEmail({
                                email: user.email,
                                subject: 'Your Issue has been Resolved! - Rural Voice',
                                message: `Hello ${user.name},\n\nWe are happy to inform you that the issue you reported: "${updatedIssue.title}" has been marked as Resolved.\n\nThank you for contributing to your community!\n\n - Rural Voice Team`
                            });
                        }

                        if (user && user.mobile) {
                            await sendSMS(user.mobile, `Rural Voice: Great news! Your issue "${updatedIssue.title}" has been Resolved.`);
                        }
                    } catch (emailError) {
                        console.error('Email send failed:', emailError);
                        // Don't fail the request if email fails
                    }
                }

                res.json(updatedIssue);
            } else {
                res.status(401);
                throw new Error('Not authorized to update status');
            }
        } else {
            res.status(404);
            throw new Error('Issue not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Vote on an issue
// @route   PUT /api/issues/:id/vote
// @access  Private
const voteIssue = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const alreadyVoted = issue.votes.find(
                (id) => id.toString() === req.user._id.toString()
            );

            if (alreadyVoted) {
                res.status(400);
                throw new Error('You have already voted for this issue');
            }

            issue.votes.push(req.user._id);

            const updatedIssue = await issue.save();
            res.json(updatedIssue);
        } else {
            res.status(404);
            throw new Error('Issue not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add a comment to an issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const comment = {
                user: req.user._id,
                text,
            };

            issue.comments.push(comment);

            await issue.save();

            // Re-fetch to populate user details
            const updatedIssue = await Issue.findById(req.params.id)
                .populate('reportedBy', 'name')
                .populate('village', 'name')
                .populate('comments.user', 'name');

            res.status(201).json(updatedIssue);
        } else {
            res.status(404);
            throw new Error('Issue not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Assign issue to a user
// @route   PUT /api/issues/:id/assign
// @access  Private/Admin
const assignIssue = async (req, res, next) => {
    try {
        const { assignedTo } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            res.status(404);
            throw new Error('Issue not found');
        }

        // Check if user is admin of the village
        if (issue.village.toString() !== req.user.village.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        issue.assignedTo = assignedTo;
        issue.status = 'In Progress'; // Auto update status
        await issue.save();

        const updatedIssue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name')
            .populate('assignedTo', 'name'); // Ensure populated for frontend

        // Notify the assigned user (Optional Check)
        if (assignedTo) {
            const worker = await User.findById(assignedTo);
            if (worker && worker.mobile) {
                await sendSMS(worker.mobile, `Rural Voice: You have been assigned a new issue: "${issue.title}". Please check dashboard.`);
            }
        }

        res.json(updatedIssue);
    } catch (error) {
        next(error);
    }
};

// @desc    Reply to a comment
// @route   POST /api/issues/:id/comments/:commentId/reply
// @access  Private
const replyToComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const comment = issue.comments.id(req.params.commentId);

            if (comment) {
                const reply = {
                    user: req.user._id,
                    text,
                };

                comment.replies.push(reply);
                await issue.save();

                const updatedIssue = await Issue.findById(req.params.id)
                    .populate('reportedBy', 'name')
                    .populate('village', 'name')
                    .populate('comments.user', 'name')
                    .populate('comments.replies.user', 'name');

                res.status(201).json(updatedIssue);
            } else {
                res.status(404);
                throw new Error('Comment not found');
            }
        } else {
            res.status(404);
            throw new Error('Issue not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add a progress update to an issue
// @route   POST /api/issues/:id/progress
// @access  Private/Coordinator/Admin
const addProgressUpdate = async (req, res, next) => {
    try {
        const { description, status } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            res.status(404);
            throw new Error('Issue not found');
        }

        // Check if user is Villager or Coordinator
        if (req.user.role !== 'Villager' && req.user.role !== 'Coordinator') {
            res.status(401);
            throw new Error('Not authorized to add progress updates');
        }

        let imageUrl = '';
        if (req.files && req.files.image) {
            imageUrl = req.files.image[0].path;
            if (!imageUrl.startsWith('http')) {
                imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
        }

        const update = {
            user: req.user._id,
            description,
            imageUrl,
        };

        issue.progressUpdates.push(update);

        if (status) {
            issue.status = status;
        }

        await issue.save();

        const updatedIssue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name')
            .populate('village', 'name')
            .populate('progressUpdates.user', 'name');

        res.status(201).json(updatedIssue);
    } catch (error) {
        next(error);
    }
};

// @desc    Get issues for the logged in user's village
// @route   GET /api/issues/my-village
// @access  Private
const getMyVillageIssues = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userVillageId = req.user.village;

        console.log(`[MYVILLAGE] Fetching for User: ${userId}, Village: ${userVillageId}`);

        if (!userVillageId) {
            console.log(`[MYVILLAGE] Error: No village ID found for user ${userId}`);
            return res.json([]); // Return empty list instead of 400 for better UI experience
        }

        const issues = await Issue.find({ village: userVillageId })
            .populate('reportedBy', 'name')
            .populate('village', 'name')
            .populate('comments.user', 'name')
            .populate('comments.replies.user', 'name')
            .sort({ createdAt: -1 });

        console.log(`[MYVILLAGE] Found ${issues.length} issues in database`);

        res.json(issues);
    } catch (error) {
        console.error('[MYVILLAGE] Error:', error);
        next(error);
    }
};

module.exports = { createIssue, getIssues, getIssueById, updateIssueStatus, voteIssue, addComment, assignIssue, replyToComment, addProgressUpdate, getMyVillageIssues };
