const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Village = require('../models/Village');
const Issue = require('../models/Issue');

jest.mock('../utils/twilioService', () => jest.fn());

describe('Issue API', () => {
    let token;
    let villageId;

    beforeAll(async () => {
        const village = await Village.create({
            name: 'Issue Village',
            district: 'Issue District',
            state: 'Issue State',
            wards: ['Ward A']
        });
        villageId = village._id;

        const user = await User.create({
            name: 'Issue User',
            mobile: '1122334455',
            password: 'password123',
            village: villageId
        });

        // Simulating login to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                identifier: '1122334455',
                password: 'password123'
            });

        token = res.body.token;
    });

    afterEach(async () => {
        await Issue.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Village.deleteMany({});
    });

    it('should create a new issue', async () => {
        const res = await request(app)
            .post('/api/issues')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Broken Pipe',
                description: 'Water pipe leaking',
                category: 'Water',
                village: villageId
            });

        if (res.statusCode !== 201) {
            require('fs').writeFileSync('issue_error.json', JSON.stringify({ status: res.statusCode, body: res.body }, null, 2));
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('title', 'Broken Pipe');
        expect(res.body).toHaveProperty('category', 'Water');
    });

    it('should get all issues', async () => {
        await Issue.create({
            title: 'Existing Issue',
            description: 'Something wrong',
            category: 'Roads',
            village: villageId,
            reportedBy: new User()._id // Dummy ID
        });

        const res = await request(app).get('/api/issues');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
});
