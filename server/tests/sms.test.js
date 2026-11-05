const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const smsService = require('../src/services/sms/smsService');
const User = require('../src/models/User');
const SMSLog = require('../src/models/SMSLog');
const { SMS_TEMPLATES, SMS_STATUS } = require('../src/config/constants');

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
  await SMSLog.deleteMany({});
});

describe('SMS Notification Gateway Suite', () => {
  test('sendNotification - Successfully dispatches SMS to patient with consent enabled', async () => {
    const patient = await User.create({
      name: 'Evelyn Reed',
      email: 'evelyn@example.com',
      password: 'Password123',
      phone: '+15553334444',
      smsConsent: true
    });

    const result = await smsService.sendNotification({
      patientId: patient._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      templateParams: {
        patientName: patient.name,
        doctorName: 'Dr. Sarah Jenkins',
        departmentName: 'Cardiology',
        appointmentDate: '2026-11-12',
        timeSlot: '09:30 - 10:00',
        bookingRef: 'MDB-20261112-TEST'
      }
    });

    expect(result.success).toBe(true);
    expect(result.logId).toBeDefined();

    const log = await SMSLog.findById(result.logId);
    expect(log).toBeDefined();
    expect(log.status).toMatch(/sent|delivered/);
    expect(log.messageBody).toContain('Dr. Sarah Jenkins');
    expect(log.messageBody).toContain('MDB-20261112-TEST');
  });

  test('sendNotification - Honors Opt-Out: skips dispatch when patient smsConsent is false', async () => {
    const optedOutPatient = await User.create({
      name: 'Opted Out Patient',
      email: 'optout@example.com',
      password: 'Password123',
      phone: '+15559998888',
      smsConsent: false // Explicitly opted out
    });

    const result = await smsService.sendNotification({
      patientId: optedOutPatient._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      templateParams: {
        patientName: optedOutPatient.name,
        doctorName: 'Dr. Sarah Jenkins',
        departmentName: 'Cardiology',
        appointmentDate: '2026-11-12',
        timeSlot: '11:00 - 11:30',
        bookingRef: 'MDB-20261112-NOOP'
      }
    });

    expect(result.success).toBe(false);
    expect(result.optedOut).toBe(true);

    const log = await SMSLog.findById(result.logId);
    expect(log.status).toBe(SMS_STATUS.OPTED_OUT);
    expect(log.provider).toBe('none');
  });
});
