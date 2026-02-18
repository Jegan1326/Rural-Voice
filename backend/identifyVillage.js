const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Village = require('./models/Village');

const identifyVillage = async (id) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const v = await Village.findById(id);
        console.log(`ID ${id} belongs to: ${v ? v.name + ' in ' + v.district : 'NOT FOUND'}`);
        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

identifyVillage(process.argv[2]);
