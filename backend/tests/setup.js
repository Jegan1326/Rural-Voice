const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

process.env.JWT_SECRET = 'test_secret';

beforeAll(async () => {
    // connect to test database
    const testURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/rural-voice-test';
    await mongoose.connect(testURI);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});
