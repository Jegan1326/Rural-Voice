const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');
const Village = require('./models/Village');

const inspectNames = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const issues = await Issue.find({}).populate('village');
        const users = await User.find({}).populate('village');

        console.log('--- ISSUES ---');
        issues.forEach(i => {
            console.log(`Title: "${i.title}", VillageID: ${i.village?._id || i.village}, VillageName: ${i.villageName} (Model Name: ${i.village?.name})`);
        });

        console.log('\n--- USERS ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Role: ${u.role}, VillageID: ${u.village?._id || u.village}, VillageName: ${u.villageName} (Model Name: ${u.village?.name})`);
        });

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectNames();
