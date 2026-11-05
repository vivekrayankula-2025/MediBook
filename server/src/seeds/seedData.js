require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const SMSLog = require('../models/SMSLog');
const { ROLES, APPOINTMENT_STATUS, SMS_TEMPLATES, SMS_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Purging old data for clean seed...');

    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      SMSLog.deleteMany({})
    ]);

    logger.info('Inserting Hospital Departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology & Heart Care',
        code: 'CARD',
        description: 'Comprehensive diagnostic, interventional, and surgical cardiovascular care.',
        headOfDepartment: 'Dr. Sarah Jenkins, MD, FACC',
        roomLocation: 'Wing A, Level 2',
        icon: 'HeartPulse'
      },
      {
        name: 'Neurology & Brain Sciences',
        code: 'NEUR',
        description: 'Expert care for neurological, spinal, and neuromuscular disorders.',
        headOfDepartment: 'Dr. Robert Chen, MD, DM',
        roomLocation: 'Wing B, Level 3',
        icon: 'Brain'
      },
      {
        name: 'Pediatrics & Child Wellness',
        code: 'PEDI',
        description: 'Compassionate pediatric healthcare from infancy through adolescence.',
        headOfDepartment: 'Dr. Emily Rodriguez, MD, FAAP',
        roomLocation: 'Wing C, Ground Floor',
        icon: 'Baby'
      },
      {
        name: 'Orthopedics & Joint Reconstruction',
        code: 'ORTH',
        description: 'Advanced sports medicine, joint replacement, and trauma surgery.',
        headOfDepartment: 'Dr. Marcus Vance, MS, FRCS',
        roomLocation: 'Wing A, Level 1',
        icon: 'Bone'
      },
      {
        name: 'Dermatology & Skin Health',
        code: 'DERM',
        description: 'Clinical and cosmetic treatments for complex skin conditions.',
        headOfDepartment: 'Dr. Lisa Ray, MD',
        roomLocation: 'Wing D, Level 2',
        icon: 'Activity'
      },
      {
        name: 'Ophthalmology & Vision Care',
        code: 'OPHT',
        description: 'State-of-the-art diagnostic and surgical eye care services.',
        headOfDepartment: 'Dr. Alan Cooper, MS',
        roomLocation: 'Wing B, Level 1',
        icon: 'Eye'
      }
    ]);

    logger.info('Creating System Administrator...');
    await User.create({
      name: 'Dr. Elizabeth Sterling (Admin)',
      email: 'admin@medibook.com',
      password: 'Admin@123',
      phone: '+15550001122',
      role: ROLES.ADMIN,
      smsConsent: true
    });

    logger.info('Creating Doctor Accounts & Clinical Profiles...');
    const doctorUsersData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'dr.jenkins@medibook.com',
        password: 'Doctor@123',
        phone: '+15551112233',
        role: ROLES.DOCTOR,
        deptCode: 'CARD',
        specialization: 'Interventional Cardiology & Heart Failure',
        qualification: 'MBBS, MD (Cardiology), FACC (USA)',
        experienceYears: 14,
        consultationFee: 800,
        roomNumber: 'Suite 204, Wing A',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
        bio: 'Board-certified cardiologist specializing in preventive cardiology, coronary interventions, and management of complex cardiac conditions.'
      },
      {
        name: 'Dr. Robert Chen',
        email: 'dr.chen@medibook.com',
        password: 'Doctor@123',
        phone: '+15552223344',
        role: ROLES.DOCTOR,
        deptCode: 'NEUR',
        specialization: 'Clinical Neurology & Neuro-rehabilitation',
        qualification: 'MBBS, MD (Internal Medicine), DM (Neurology)',
        experienceYears: 11,
        consultationFee: 700,
        roomNumber: 'Suite 310, Wing B',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        bio: 'Specialist in stroke recovery, epilepsy management, migraine therapies, and neurodegenerative disorders.'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'dr.rodriguez@medibook.com',
        password: 'Doctor@123',
        phone: '+15553334455',
        role: ROLES.DOCTOR,
        deptCode: 'PEDI',
        specialization: 'Pediatric Care & Child Nutrition',
        qualification: 'MBBS, MD (Pediatrics), FAAP',
        experienceYears: 9,
        consultationFee: 600,
        roomNumber: 'Suite 102, Wing C',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813576-0f72363b8655?w=400&auto=format&fit=crop&q=80',
        bio: 'Dedicated pediatrician with passionate focus on neonatal care, childhood developmental milestones, and routine immunizations.'
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'dr.vance@medibook.com',
        password: 'Doctor@123',
        phone: '+15554445566',
        role: ROLES.DOCTOR,
        deptCode: 'ORTH',
        specialization: 'Orthopedic Surgery & Sports Medicine',
        qualification: 'MBBS, MS (Orthopedics), Fellowship Joint Replacement',
        experienceYears: 16,
        consultationFee: 1000,
        roomNumber: 'Suite 108, Wing A',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
        bio: 'Pioneer in minimally invasive arthroscopic surgery, sports injury rehabilitation, and hip and knee arthroplasty.'
      }
    ];

    const doctorsCreated = [];

    for (const d of doctorUsersData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: d.password,
        phone: d.phone,
        role: d.role,
        smsConsent: true
      });

      const dept = departments.find((dept) => dept.code === d.deptCode);

      const doctorProfile = await Doctor.create({
        userId: user._id,
        departmentId: dept._id,
        specialization: d.specialization,
        qualification: d.qualification,
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
        roomNumber: d.roomNumber,
        avatarUrl: d.avatarUrl,
        bio: d.bio,
        ratingsAverage: 4.9,
        ratingsQuantity: 28,
        weeklySchedule: [
          { dayOfWeek: 1, dayName: 'Monday', isWorkingDay: true, startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
          { dayOfWeek: 2, dayName: 'Tuesday', isWorkingDay: true, startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
          { dayOfWeek: 3, dayName: 'Wednesday', isWorkingDay: true, startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
          { dayOfWeek: 4, dayName: 'Thursday', isWorkingDay: true, startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
          { dayOfWeek: 5, dayName: 'Friday', isWorkingDay: true, startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
          { dayOfWeek: 6, dayName: 'Saturday', isWorkingDay: true, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '', maxPatientsPerSlot: 1 },
          { dayOfWeek: 0, dayName: 'Sunday', isWorkingDay: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '', maxPatientsPerSlot: 1 }
        ]
      });

      doctorsCreated.push({ user, profile: doctorProfile, dept });
    }

    logger.info('Creating Demo Patient Accounts...');
    const patientUsersData = [
      {
        name: 'John Davis',
        email: 'patient.john@example.com',
        password: 'Patient@123',
        phone: '+15551234567',
        age: 38,
        gender: 'male',
        bloodGroup: 'O+',
        smsConsent: true,
        address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zipCode: '62704' },
        emergencyContact: { name: 'Mary Davis', phone: '+15551239999', relation: 'Spouse' }
      },
      {
        name: 'Alice Miller',
        email: 'patient.alice@example.com',
        password: 'Patient@123',
        phone: '+15559876543',
        age: 29,
        gender: 'female',
        bloodGroup: 'A+',
        smsConsent: true,
        address: { street: '124 Conch Street', city: 'Bikini Bottom', state: 'CA', zipCode: '90210' },
        emergencyContact: { name: 'James Miller', phone: '+15559871111', relation: 'Brother' }
      },
      {
        name: 'David Wilson',
        email: 'patient.david@example.com',
        password: 'Patient@123',
        phone: '+15555550199',
        age: 52,
        gender: 'male',
        bloodGroup: 'B+',
        smsConsent: false, // Testing opt-out functionality
        address: { street: '350 Fifth Ave', city: 'New York', state: 'NY', zipCode: '10118' },
        emergencyContact: { name: 'Emma Wilson', phone: '+15555550200', relation: 'Daughter' }
      }
    ];

    const patientsCreated = await User.create(patientUsersData);

    logger.info('Creating Realistic Appointments & Initializing SMS Logs...');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 3);
    const pastStr = pastDate.toISOString().split('T')[0];

    // 1. Confirmed appointment for John Davis with Dr. Jenkins today
    const appt1 = await Appointment.create({
      bookingReference: `MDB-${todayStr.replace(/-/g, '')}-JD01`,
      patientId: patientsCreated[0]._id,
      doctorId: doctorsCreated[0].profile._id,
      departmentId: doctorsCreated[0].dept._id,
      appointmentDate: todayStr,
      timeSlot: { startTime: '10:00', endTime: '10:30' },
      status: APPOINTMENT_STATUS.CONFIRMED,
      reasonForVisit: 'Annual cardiovascular checkup and mild shortness of breath during workouts',
      consultationFee: doctorsCreated[0].profile.consultationFee,
      paymentMethod: 'pay_at_clinic',
      smsDeliveryStatus: {
        confirmationSent: true,
        reminderSent: true,
        lastSmsStatus: 'delivered'
      }
    });

    await SMSLog.create({
      recipientPhone: patientsCreated[0].phone,
      patientId: patientsCreated[0]._id,
      appointmentId: appt1._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      messageBody: `Hello John Davis, your appointment with Dr. Sarah Jenkins (Cardiology & Heart Care) at MediBook Central Hospital is CONFIRMED for ${todayStr} at 10:00 - 10:30. Ref: ${appt1.bookingReference}. Helpline: +1-800-555-0199. Reply STOP to opt out.`,
      provider: 'mock',
      providerMessageId: 'mock_sms_seed_101',
      status: SMS_STATUS.DELIVERED,
      deliveryTimestamp: new Date()
    });

    // 2. Upcoming appointment for Alice Miller with Dr. Chen tomorrow
    const appt2 = await Appointment.create({
      bookingReference: `MDB-${tomorrowStr.replace(/-/g, '')}-AM02`,
      patientId: patientsCreated[1]._id,
      doctorId: doctorsCreated[1].profile._id,
      departmentId: doctorsCreated[1].dept._id,
      appointmentDate: tomorrowStr,
      timeSlot: { startTime: '11:00', endTime: '11:30' },
      status: APPOINTMENT_STATUS.CONFIRMED,
      reasonForVisit: 'Persistent tension headaches and migraine aura',
      consultationFee: doctorsCreated[1].profile.consultationFee,
      paymentMethod: 'pay_at_clinic',
      smsDeliveryStatus: {
        confirmationSent: true,
        reminderSent: false,
        lastSmsStatus: 'delivered'
      }
    });

    await SMSLog.create({
      recipientPhone: patientsCreated[1].phone,
      patientId: patientsCreated[1]._id,
      appointmentId: appt2._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      messageBody: `Hello Alice Miller, your appointment with Dr. Robert Chen (Neurology & Brain Sciences) at MediBook Central Hospital is CONFIRMED for ${tomorrowStr} at 11:00 - 11:30. Ref: ${appt2.bookingReference}. Helpline: +1-800-555-0199. Reply STOP to opt out.`,
      provider: 'mock',
      providerMessageId: 'mock_sms_seed_102',
      status: SMS_STATUS.DELIVERED,
      deliveryTimestamp: new Date()
    });

    // 3. Completed past appointment for John Davis with Dr. Vance
    await Appointment.create({
      bookingReference: `MDB-${pastStr.replace(/-/g, '')}-JD03`,
      patientId: patientsCreated[0]._id,
      doctorId: doctorsCreated[3].profile._id,
      departmentId: doctorsCreated[3].dept._id,
      appointmentDate: pastStr,
      timeSlot: { startTime: '14:00', endTime: '14:30' },
      status: APPOINTMENT_STATUS.COMPLETED,
      reasonForVisit: 'Right knee pain after playing tennis',
      consultationFee: doctorsCreated[3].profile.consultationFee,
      paymentMethod: 'pay_at_clinic',
      paymentStatus: 'paid',
      doctorDiagnosis: 'Mild patellar tendinitis; no ligament tear detected on physical exam.',
      notes: 'Advised rest, ice packs 3x/day, and quadriceps strengthening exercises.',
      prescriptions: [
        {
          medicineName: 'Ibuprofen 400mg',
          dosage: '400mg',
          frequency: 'Twice daily after meals',
          duration: '5 days',
          instructions: 'Take with plenty of water. Discontinue if stomach irritation occurs.'
        }
      ],
      smsDeliveryStatus: {
        confirmationSent: true,
        reminderSent: true,
        lastSmsStatus: 'delivered'
      }
    });

    // 4. Opted-out patient test log
    await SMSLog.create({
      recipientPhone: patientsCreated[2].phone,
      patientId: patientsCreated[2]._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      messageBody: '[SMS NOT DISPATCHED - PATIENT OPTED OUT]',
      provider: 'none',
      status: SMS_STATUS.OPTED_OUT,
      metadata: { reason: 'Patient opted out of notifications' }
    });

    logger.success('===============================================================');
    logger.success(' MediBook Database Seeding Completed Successfully! ');
    logger.success('===============================================================');
    logger.info('DEMO ACCOUNTS READY:');
    logger.info('1. ADMIN:    admin@medibook.com       / Admin@123');
    logger.info('2. DOCTORS:');
    logger.info('   Cardiology:  dr.jenkins@medibook.com   / Doctor@123');
    logger.info('   Neurology:   dr.chen@medibook.com      / Doctor@123');
    logger.info('   Pediatrics:  dr.rodriguez@medibook.com / Doctor@123');
    logger.info('   Orthopedics: dr.vance@medibook.com     / Doctor@123');
    logger.info('3. PATIENTS:');
    logger.info('   John Davis:   patient.john@example.com  / Patient@123');
    logger.info('   Alice Miller: patient.alice@example.com / Patient@123');
    logger.info('   David Wilson: patient.david@example.com / Patient@123 (SMS Opted Out)');
    logger.success('===============================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
