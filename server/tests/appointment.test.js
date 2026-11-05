const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');
const SMSLog = require('../src/models/SMSLog');

let mongoServer;
let patientToken1;
let patient1Id;
let patientToken2;
let doctorId;
let departmentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create department
  const dept = await Department.create({
    name: 'Cardiology',
    code: 'CARD',
    description: 'Heart care',
    roomLocation: 'Level 2'
  });
  departmentId = dept._id;

  // Create doctor user
  const docUser = await User.create({
    name: 'Dr. Test Specialist',
    email: 'dr.test@example.com',
    password: 'Password123',
    phone: '+15551110000',
    role: 'doctor'
  });

  // Create doctor profile
  const doctor = await Doctor.create({
    userId: docUser._id,
    departmentId: dept._id,
    specialization: 'Cardiology',
    qualification: 'MD',
    consultationFee: 500
  });
  doctorId = doctor._id;

  // Create Patient 1
  const pat1 = await User.create({
    name: 'Patient One',
    email: 'p1@example.com',
    password: 'Password123',
    phone: '+15552220001',
    role: 'patient',
    smsConsent: true
  });
  patient1Id = pat1._id;
  patientToken1 = jwt.sign({ id: pat1._id }, process.env.JWT_SECRET || 'medibook_super_secret_jwt_key_2026_final_year_project_secure');

  // Create Patient 2
  const pat2 = await User.create({
    name: 'Patient Two',
    email: 'p2@example.com',
    password: 'Password123',
    phone: '+15552220002',
    role: 'patient',
    smsConsent: true
  });
  patientToken2 = jwt.sign({ id: pat2._id }, process.env.JWT_SECRET || 'medibook_super_secret_jwt_key_2026_final_year_project_secure');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Appointment.deleteMany({});
  await SMSLog.deleteMany({});
});

describe('Appointment Booking & Concurrency Suite (/api/appointments)', () => {
  const bookingPayload = {
    appointmentDate: '2026-11-10',
    timeSlot: { startTime: '10:00', endTime: '10:30' },
    reasonForVisit: 'Routine cardiac health assessment'
  };

  test('POST /api/appointments - Successfully books available slot and creates SMS log', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken1}`)
      .send({ ...bookingPayload, doctorId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingReference).toBeDefined();
    expect(res.body.data.status).toBe('confirmed');

    // Verify SMS log was created for the booking
    const smsLog = await SMSLog.findOne({ appointmentId: res.body.data._id });
    expect(smsLog).toBeDefined();
    expect(smsLog.recipientPhone).toBe('+15552220001');
  });

  test('POST /api/appointments - ATOMIC DOUBLE BOOKING PREVENTION: Rejects second booking on same slot with 409 Conflict', async () => {
    // 1. Patient 1 books the slot first
    const firstRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken1}`)
      .send({ ...bookingPayload, doctorId });

    expect(firstRes.status).toBe(201);

    // 2. Patient 2 attempts to book the EXACT SAME slot for the SAME doctor and date
    const secondRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken2}`)
      .send({ ...bookingPayload, doctorId });

    // Assert that the double booking was strictly rejected
    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toMatch(/already reserved|different time slot/i);
  });
});
