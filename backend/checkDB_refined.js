const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const allIssues = await Issue.find({});
        console.log(`Total Issues in DB: ${allIssues.length}`);

        if (allIssues.length > 0) {
            console.log('Sample Issue Village IDs:');
            allIssues.slice(0, 5).forEach(i => {
                console.log(`- Issue: ${i.title}, VillageID: ${i.village} (${typeof i.village})`);
            });
        }

        const allUsers = await User.find({ role: 'Villager' });
        console.log(`\nTotal Villager Users: ${allUsers.length}`);
        if (allUsers.length > 0) {
            console.log('Sample User Village IDs:');
            allUsers.slice(0, 5).forEach(u => {
                console.log(`- User: ${u.name}, VillageID: ${u.village} (${typeof u.village})`);
            });

            const firstUser = allUsers[0];
            const matchingIssues = await Issue.find({ village: firstUser.village });
            console.log(`\nIssues matching first user's village (${firstUser.village}): ${matchingIssues.length}`);
        }

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
