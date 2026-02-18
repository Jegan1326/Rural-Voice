const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');

const checkTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const issue = await Issue.findOne({});
        const user = await User.findOne({ role: 'Villager' });

        if (issue) {
            console.log('Issue Title:', issue.title);
            console.log('Issue Village Type:', typeof issue.village);
            console.log('Issue Village Constructor:', issue.village.constructor.name);
            console.log('Issue Village Value:', issue.village.toString());
        }

        if (user) {
            console.log('\nUser Name:', user.name);
            console.log('User Village Type:', typeof user.village);
            console.log('User Village Constructor:', user.village ? user.village.constructor.name : 'N/A');
            console.log('User Village Value:', user.village ? user.village.toString() : 'N/A');
        }

        if (issue && user) {
            const match = issue.village.toString() === user.village.toString();
            console.log(`\nExact String Match: ${match}`);

            const queryMatch = await Issue.findOne({ village: user.village });
            console.log(`Query Match (Mongoose findOne): ${queryMatch ? 'Found' : 'Not Found'}`);
        }

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTypes();
