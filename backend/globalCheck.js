const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');

const globalCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const issues = await Issue.find({});
        const users = await User.find({});

        console.log(`Total Issues: ${issues.length}`);
        console.log(`Total Users: ${users.length}`);

        for (const user of users) {
            const villageId = user.village?.toString();
            if (!villageId) continue;

            const visibleIssues = issues.filter(i => (i.village?._id || i.village)?.toString() === villageId);
            if (visibleIssues.length > 0) {
                console.log(`User ${user.name} (${user.role}) can see ${visibleIssues.length} issues in village ${villageId}`);
            }
        }

        // Check for issues with NO village or invalid village
        const orphaned = issues.filter(i => !i.village);
        console.log(`Orphaned Issues (no village): ${orphaned.length}`);

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

globalCheck();
