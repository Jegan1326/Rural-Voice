const cron = require('node-cron');
const Issue = require('../models/Issue');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const startEscalationJob = () => {
    // Run every day at midnight: '0 0 * * *'
    // For demo purposes, we can run every minute: '* * * * *'
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Escalation Job...');
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Find issues older than 7 days that are not resolved and not already High priority
            const staleIssues = await Issue.find({
                createdAt: { $lt: sevenDaysAgo },
                status: { $in: ['Submitted', 'In Progress'] },
                priority: { $ne: 'High' }
            });

            if (staleIssues.length > 0) {
                console.log(`Found ${staleIssues.length} stale issues. Escalating...`);

                const updates = staleIssues.map(async (issue) => {
                    issue.priority = 'High';
                    await issue.save();

                    // Notify Admin of the village (or general admin)
                    // For now, simpler notification logic
                    console.log(`Escalated Issue ID: ${issue._id} to High Priority`);
                });

                await Promise.all(updates);
                console.log('Escalation Job Completed.');
            } else {
                console.log('No stale issues found.');
            }
        } catch (error) {
            console.error('Escalation Job Failed:', error);
        }
    });

    console.log('Escalation Job Scheduled (Daily at Midnight).');
};

module.exports = startEscalationJob;
