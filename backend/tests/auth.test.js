const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Village = require('../models/Village');
const mongoose = require('mongoose');

describe('Auth API', () => {
    let villageId;

    beforeAll(async () => {
        // Create a dummy village
        const village = await Village.create({
            name: 'Test Village',
            district: 'Test District',
            state: 'Test State',
            wards: ['Ward 1']
        });
        villageId = village._id;
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await Village.deleteMany({});
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                mobile: '1234567890',
                password: 'password123',
                village: villageId
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('name', 'Test User');
    });

    it('should login a user', async () => {
        // Create user
        await User.create({
            name: 'Login User',
            mobile: '9876543210',
            password: 'password123',
            village: villageId
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                identifier: '9876543210',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
