const Issue = require('../models/Issue');
const Village = require('../models/Village');

// @desc    Get system analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
    try {
        const totalIssues = await Issue.countDocuments();
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const pendingIssues = await Issue.countDocuments({ status: { $ne: 'Resolved' } });

        const issuesByCategory = await Issue.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const issuesByStatus = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const topVillages = await Issue.aggregate([
            { $group: { _id: '$village', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'villages', localField: '_id', foreignField: '_id', as: 'villageDetails' } },
            { $unwind: '$villageDetails' },
            { $project: { name: '$villageDetails.name', count: 1 } }
        ]);

        res.json({
            totalIssues,
            resolvedIssues,
            pendingIssues,
            issuesByCategory,
            issuesByStatus,
            topVillages,
            statusDistribution,
            categoryDistribution
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Suggest category based on description (Simple AI)
// @route   POST /api/analytics/suggest-category
// @access  Private
const suggestCategory = async (req, res, next) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const keywords = {
            'Water': ['water', 'leak', 'pipe', 'supply', 'tap', 'drink', 'dry'],
            'Roads': ['road', 'pothole', 'street', 'asphalt', 'traffic', 'repair'],
            'Electricity': ['electricity', 'light', 'pole', 'wire', 'shock', 'power', 'cut'],
            'Sanitation': ['garbage', 'trash', 'drain', 'sewage', 'clean', 'dustbin', 'waste'],
            'Agriculture': ['crop', 'farm', 'seed', 'irrigation', 'fertilizer', 'pest'],
            'Public Safety': ['theft', 'crime', 'police', 'safe', 'danger', 'animal']
        };

        let bestCategory = 'Other';
        let maxMatches = 0;

        const lowerDesc = description.toLowerCase();

        for (const [category, words] of Object.entries(keywords)) {
            let matches = 0;
            words.forEach(word => {
                if (lowerDesc.includes(word)) matches++;
            });
            if (matches > maxMatches) {
                maxMatches = matches;
                bestCategory = category;
            }
        }

        res.json({ category: bestCategory });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAnalytics, suggestCategory };
