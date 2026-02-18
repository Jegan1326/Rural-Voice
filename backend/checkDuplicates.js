const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Village = require('./models/Village');

const checkDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const villages = await Village.find({});
        console.log(`Total Villages: ${villages.length}`);

        const names = {};
        villages.forEach(v => {
            if (!names[v.name]) names[v.name] = [];
            names[v.name].push({ id: v._id, district: v.district });
        });

        const duplicates = Object.keys(names).filter(name => names[name].length > 1);
        console.log('--- Duplicate Names ---');
        duplicates.forEach(name => {
            console.log(`Name: "${name}"`);
            names[name].forEach(v => {
                console.log(` - ID: ${v.id}, District: ${v.district}`);
            });
        });

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDuplicates();
