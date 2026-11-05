const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Suite (/api/auth)', () => {
  const testPatient = {
    name: 'Test Patient',
    email: 'test.patient@example.com',
    password: 'Password123!',
    phone: '+15551239999',
    age: 30,
    gender: 'male',
    bloodGroup: 'O+'
  };

  test('POST /api/auth/register - Should register a new patient successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testPatient);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testPatient.email);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('patient');
  });

  test('POST /api/auth/register - Should reject duplicate email with 409 Conflict', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(testPatient);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/auth/login - Should authenticate valid credentials and return JWT', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testPatient.email,
        password: testPatient.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testPatient.email);
  });

  test('POST /api/auth/login - Should reject invalid password with 401 Unauthorized', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testPatient.email,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
