const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');
const User = require('./models/User');
const Village = require('./models/Village');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const uniqueIssueVillages = await Issue.distinct('village');
        console.log('Unique Village IDs in Issues:', uniqueIssueVillages);

        const uniqueUserVillages = await User.distinct('village');
        console.log('Unique Village IDs in Users:', uniqueUserVillages);

        for (const vid of uniqueIssueVillages) {
            const village = await Village.findById(vid);
            console.log(`Issue Village ID ${vid} belongs to: ${village ? village.name : 'UNKNOWN VILLAGE'}`);
        }

        for (const vid of uniqueUserVillages) {
            const village = await Village.findById(vid);
            console.log(`User Village ID ${vid} belongs to: ${village ? village.name : 'UNKNOWN VILLAGE'}`);
        }

        const issuesWithoutVillage = await Issue.find({ village: { $exists: false } });
        console.log(`Issues without village field: ${issuesWithoutVillage.length}`);

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
