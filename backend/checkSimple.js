const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');

const checkSimple = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const latestIssue = await Issue.findOne({}).sort({ createdAt: -1 });
        const allUsers = await User.find({});

        console.log('Total Issues:', await Issue.countDocuments());
        if (latestIssue) {
            console.log('Latest Issue:', latestIssue.title);
            console.log(' - Village ID:', latestIssue.village);
            console.log(' - Reported By:', latestIssue.reportedBy);
        }

        allUsers.forEach(u => {
            console.log(`User: ${u.name} (${u.role}), Village: ${u.village}`);
        });

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSimple();
