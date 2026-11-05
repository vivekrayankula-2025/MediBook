const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Otp = require('../src/models/Otp');
const SMSLog = require('../src/models/SMSLog');

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
  await Otp.deleteMany({});
  await SMSLog.deleteMany({});
});

describe('OTP API Suite (/api/auth/send-otp, /api/auth/verify-otp)', () => {
  const phone = '+15557778888';

  test('POST /api/auth/send-otp - Successfully sends an OTP to the recipient phone', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone, purpose: 'phone_verification' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.otpId).toBeDefined();
    expect(res.body.data.expiresAt).toBeDefined();

    const log = await SMSLog.findOne({ recipientPhone: phone });
    expect(log).toBeDefined();
    expect(log.status).toMatch(/sent|delivered/);
  });

  test('POST /api/auth/send-otp - Rejects a second request within the resend cooldown', async () => {
    await request(app).post('/api/auth/send-otp').send({ phone, purpose: 'phone_verification' });

    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone, purpose: 'phone_verification' });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/verify-otp - Successfully verifies the correct OTP', async () => {
    const sendRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone, purpose: 'phone_verification' });

    const { devOtp } = sendRes.body.data;
    expect(devOtp).toBeDefined(); // exposed outside production for test/demo purposes

    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp: devOtp, purpose: 'phone_verification' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    const otpDoc = await Otp.findOne({ phone, purpose: 'phone_verification' });
    expect(otpDoc.verified).toBe(true);
  });

  test('POST /api/auth/verify-otp - Rejects an incorrect OTP', async () => {
    await request(app).post('/api/auth/send-otp').send({ phone, purpose: 'phone_verification' });

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp: '000000', purpose: 'phone_verification' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
