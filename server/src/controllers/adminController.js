const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const SMSLog = require('../models/SMSLog');
const { ROLES, APPOINTMENT_STATUS, SMS_STATUS } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin dashboard metrics and analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Core metrics in parallel
  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    todayAppointments,
    completedAppointments,
    cancelledAppointments,
    totalSMSLogs,
    deliveredSMSLogs,
    failedSMSLogs,
    optedOutSMSLogs
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.PATIENT }),
    Doctor.countDocuments({}),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ appointmentDate: todayStr }),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.COMPLETED }),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.CANCELLED }),
    SMSLog.countDocuments({}),
    SMSLog.countDocuments({ status: { $in: [SMS_STATUS.DELIVERED, SMS_STATUS.SENT] } }),
    SMSLog.countDocuments({ status: SMS_STATUS.FAILED }),
    SMSLog.countDocuments({ status: SMS_STATUS.OPTED_OUT })
  ]);

  // Calculate Revenue
  const revenueResult = await Appointment.aggregate([
    {
      $match: {
        status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$consultationFee' }
      }
    }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Appointments per Department
  const deptBreakdown = await Appointment.aggregate([
    {
      $group: {
        _id: '$departmentId',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'dept'
      }
    },
    {
      $unwind: '$dept'
    },
    {
      $project: {
        _id: 1,
        name: '$dept.name',
        code: '$dept.code',
        count: 1
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Delivery Rate Calculation
  const dispatchAttempted = totalSMSLogs - optedOutSMSLogs;
  const deliveryRate =
    dispatchAttempted > 0
      ? Math.round((deliveredSMSLogs / dispatchAttempted) * 100)
      : 100;

  return ApiResponse.success(res, {
    metrics: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue
    },
    smsAnalytics: {
      totalSMSLogs,
      deliveredSMSLogs,
      failedSMSLogs,
      optedOutSMSLogs,
      deliveryRate
    },
    departmentBreakdown: deptBreakdown
  });
});

// @desc    Get all registered patients
// @route   GET /api/admin/patients
// @access  Private (Admin)
exports.getPatients = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { role: ROLES.PATIENT };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const patients = await User.find(filter).sort({ createdAt: -1 });

  // Attach appointment count to each patient
  const patientsWithCounts = await Promise.all(
    patients.map(async (pat) => {
      const appointmentsCount = await Appointment.countDocuments({ patientId: pat._id });
      return {
        ...pat.toObject(),
        appointmentsCount
      };
    })
  );

  return ApiResponse.success(res, patientsWithCounts);
});

// @desc    Create a new doctor (User + Doctor profile)
// @route   POST /api/admin/doctors
// @access  Private (Admin)
exports.createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    departmentId,
    specialization,
    qualification,
    experienceYears,
    consultationFee,
    roomNumber,
    bio,
    avatarUrl,
    weeklySchedule
  } = req.body;

  // Check email conflict
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'User with this email already exists.', 409);
  }

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.DOCTOR,
    smsConsent: true
  });

  // Create Doctor Profile
  const doctor = await Doctor.create({
    userId: user._id,
    departmentId,
    specialization,
    qualification,
    experienceYears: Number(experienceYears) || 1,
    consultationFee: Number(consultationFee) || 500,
    roomNumber: roomNumber || 'Room 101',
    bio: bio || 'Experienced physician committed to patient excellence.',
    avatarUrl: avatarUrl || '',
    weeklySchedule: weeklySchedule || undefined
  });

  await doctor.populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'departmentId', select: 'name code' }
  ]);

  return ApiResponse.created(res, doctor, 'Doctor registered successfully');
});

// @desc    Update doctor profile & status
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin)
exports.updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return ApiResponse.error(res, 'Doctor not found', 404);
  }

  const {
    name,
    phone,
    departmentId,
    specialization,
    qualification,
    experienceYears,
    consultationFee,
    roomNumber,
    bio,
    isAvailable,
    weeklySchedule
  } = req.body;

  // Update linked User info
  if (name || phone) {
    const user = await User.findById(doctor.userId);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
    }
  }

  if (departmentId) doctor.departmentId = departmentId;
  if (specialization) doctor.specialization = specialization;
  if (qualification) doctor.qualification = qualification;
  if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
  if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
  if (roomNumber) doctor.roomNumber = roomNumber;
  if (bio) doctor.bio = bio;
  if (isAvailable !== undefined) doctor.isAvailable = Boolean(isAvailable);
  if (weeklySchedule) doctor.weeklySchedule = weeklySchedule;

  await doctor.save();

  await doctor.populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'departmentId', select: 'name code' }
  ]);

  return ApiResponse.success(res, doctor, 'Doctor updated successfully');
});

// @desc    Get all appointments hospital-wide
// @route   GET /api/admin/appointments
// @access  Private (Admin)
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, departmentId, date } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (doctorId) filter.doctorId = doctorId;
  if (departmentId) filter.departmentId = departmentId;
  if (date) filter.appointmentDate = date;

  const appointments = await Appointment.find(filter)
    .populate('patientId', 'name email phone')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone' }
    })
    .populate('departmentId', 'name code')
    .sort({ appointmentDate: -1, 'timeSlot.startTime': -1 });

  return ApiResponse.success(res, appointments);
});
