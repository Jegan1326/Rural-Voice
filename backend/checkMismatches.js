const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');
const Village = require('./models/Village');

const checkMismatches = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- DB Inspection ---');

        const issues = await Issue.find({}).populate('village');
        console.log(`Total Issues: ${issues.length}`);

        issues.forEach(i => {
            console.log(`Issue: "${i.title}"`);
            console.log(` - Village Field (Value): ${i.village?._id || i.village}`);
            console.log(` - Village Name (Populated): ${i.village?.name || 'NOT POPULATED'}`);
            console.log(` - Reported By (ID): ${i.reportedBy}`);
        });

        const users = await User.find({ role: { $ne: 'Admin' } });
        console.log(`\nTotal Users (Non-Admin): ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.name} (${u.role})`);
            console.log(` - Village Field: ${u.village}`);
        });

        // Check if issues' village matches any user's village
        console.log('\n--- Match Check ---');
        for (const issue of issues) {
            const issueVid = (issue.village?._id || issue.village).toString();
            const matchingUsers = users.filter(u => u.village && u.village.toString() === issueVid);
            console.log(`Issue "${issue.title}" (Vid: ${issueVid}) matches ${matchingUsers.length} users.`);
            if (matchingUsers.length > 0) {
                console.log(`   Matches users: ${matchingUsers.map(u => u.name).join(', ')}`);
            }
        }

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkMismatches();
