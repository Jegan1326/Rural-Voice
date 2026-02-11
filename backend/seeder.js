const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Village = require('./models/Village');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Village.deleteMany();

        const village = await Village.create({
            name: 'Demo Village',
            district: 'Demo District',
            state: 'Demo State',
            wards: ['Ward 1', 'Ward 2', 'Ward 3'],
        });

        const users = [
            {
                name: 'Admin User',
                mobile: '9999999999',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin',
                village: village._id,
            },
            {
                name: 'Village Coordinator',
                mobile: '8888888888',
                email: 'coordinator@example.com',
                password: 'password123',
                role: 'Coordinator',
                village: village._id,
            },
            {
                name: 'Villager User',
                mobile: '7777777777',
                email: 'villager@example.com',
                password: 'password123',
                role: 'Villager',
                village: village._id,
                ward: 'Ward 1',
            },
        ];

        await User.create(users);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
