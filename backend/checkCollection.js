const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Issue = require('./models/Issue');

const checkCollection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Issue Model Collection Name:', Issue.collection.name);

        const rawIssues = await Issue.collection.find({}).toArray();
        console.log(`Total Raw Issues in "${Issue.collection.name}": ${rawIssues.length}`);

        if (rawIssues.length > 0) {
            const first = rawIssues[0];
            console.log('First Raw Issue:', JSON.stringify({
                _id: first._id,
                title: first.title,
                village: first.village,
                villageType: typeof first.village,
                villageIsObjectId: first.village instanceof mongoose.Types.ObjectId
            }, null, 2));
        }

        await mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCollection();
