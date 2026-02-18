const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');
const Village = require('./models/Village');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const issues = await Issue.find({}).limit(5);
        console.log('--- Sample Issues ---');
        issues.forEach(i => {
            console.log(`ID: ${i._id}, Title: ${i.title}, Village (ObjectId): ${i.village}, VillageName (String): ${i.villageName}`);
        });

        const users = await User.find({ role: { $in: ['Villager', 'Coordinator'] } }).limit(5);
        console.log('\n--- Sample Users (Villager/Coordinator) ---');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Role: ${u.role}, Village (ObjectId): ${u.village}`);
        });

        const villages = await Village.find({}).limit(5);
        console.log('\n--- Sample Villages ---');
        villages.forEach(v => {
            console.log(`ID: ${v._id}, Name: ${v.name}, District: ${v.district}`);
        });

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
