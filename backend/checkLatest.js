const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');

const checkLatest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const latestIssue = await Issue.findOne({}).sort({ createdAt: -1 }).populate('village');
        if (!latestIssue) {
            console.log('No issues found in database.');
            process.exit();
        }

        console.log('--- LATEST ISSUE ---');
        console.log(`Title: ${latestIssue.title}`);
        console.log(`Created At: ${latestIssue.createdAt}`);
        console.log(`Village ID: ${latestIssue.village?._id || latestIssue.village}`);
        console.log(`Village Name: ${latestIssue.villageName}`);
        console.log(`Reported By (ID): ${latestIssue.reportedBy}`);

        const reporter = await User.findById(latestIssue.reportedBy);
        if (reporter) {
            console.log('\n--- REPORTER ---');
            console.log(`Name: ${reporter.name}`);
            console.log(`Role: ${reporter.role}`);
            console.log(`Village ID in Profile: ${reporter.village}`);

            const match = reporter.village?.toString() === (latestIssue.village?._id || latestIssue.village)?.toString();
            console.log(`Village ID Match: ${match}`);
        }

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLatest();
