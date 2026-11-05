const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const slotService = require('../services/slotService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS } = require('../config/constants');

// @desc    Get doctors with search and filter
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = asyncHandler(async (req, res) => {
  const { department, search, sort = 'rating' } = req.query;

  const query = { isAvailable: true };

  if (department) {
    query.departmentId = department;
  }

  let doctorQuery = Doctor.find(query)
    .populate('userId', 'name email phone')
    .populate('departmentId', 'name code roomLocation icon');

  // Sorting
  if (sort === 'fee_low') {
    doctorQuery = doctorQuery.sort({ consultationFee: 1 });
  } else if (sort === 'fee_high') {
    doctorQuery = doctorQuery.sort({ consultationFee: -1 });
  } else if (sort === 'experience') {
    doctorQuery = doctorQuery.sort({ experienceYears: -1 });
  } else {
    // default rating
    doctorQuery = doctorQuery.sort({ ratingsAverage: -1 });
  }

  let doctors = await doctorQuery;

  // Search filter across Doctor name and specialization
  if (search) {
    const term = search.toLowerCase();
    doctors = doctors.filter((doc) => {
      const docName = doc.userId?.name?.toLowerCase() || '';
      const spec = doc.specialization?.toLowerCase() || '';
      const deptName = doc.departmentId?.name?.toLowerCase() || '';
      return docName.includes(term) || spec.includes(term) || deptName.includes(term);
    });
  }

  return ApiResponse.success(res, doctors);
});

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('departmentId', 'name code roomLocation description');

  if (!doctor) {
    return ApiResponse.error(res, 'Doctor not found', 404);
  }

  return ApiResponse.success(res, doctor);
});

// @desc    Get real-time available appointment slots for a specific date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return ApiResponse.error(res, 'Query parameter "date" (format YYYY-MM-DD) is required.', 400);
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return ApiResponse.error(res, 'Invalid date format. Expected YYYY-MM-DD.', 400);
  }

  const slotData = await slotService.getAvailableSlotsForDoctor(req.params.id, date);
  return ApiResponse.success(res, slotData);
});

// @desc    Update doctor's weekly schedule & availability
// @route   PUT /api/doctors/schedule
// @access  Private (Doctor or Admin)
exports.updateSchedule = asyncHandler(async (req, res) => {
  let doctor = null;

  if (req.user.role === 'doctor') {
    doctor = await Doctor.findOne({ userId: req.user._id });
  } else if (req.user.role === 'admin' && req.body.doctorId) {
    doctor = await Doctor.findById(req.body.doctorId);
  }

  if (!doctor) {
    return ApiResponse.error(res, 'Doctor profile not found', 404);
  }

  const { weeklySchedule, isAvailable } = req.body;

  if (weeklySchedule && Array.isArray(weeklySchedule)) {
    doctor.weeklySchedule = weeklySchedule;
  }

  if (isAvailable !== undefined) {
    doctor.isAvailable = Boolean(isAvailable);
  }

  await doctor.save();

  return ApiResponse.success(res, doctor, 'Doctor schedule updated successfully');
});

// @desc    Get appointments for the logged-in doctor
// @route   GET /api/doctors/me/appointments
// @access  Private (Doctor)
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return ApiResponse.error(res, 'Doctor profile not found for this account', 404);
  }

  const { status, date } = req.query;
  const filter = { doctorId: doctor._id };

  if (status) {
    filter.status = status;
  }
  if (date) {
    filter.appointmentDate = date;
  }

  const appointments = await Appointment.find(filter)
    .populate('patientId', 'name email phone age gender bloodGroup')
    .populate('departmentId', 'name code')
    .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 });

  return ApiResponse.success(res, appointments);
});

// @desc    Update consultation details & prescriptions
// @route   PUT /api/doctors/appointments/:id/consultation
// @access  Private (Doctor)
exports.updateConsultation = asyncHandler(async (req, res) => {
  const { doctorDiagnosis, notes, prescriptions, status } = req.body;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return ApiResponse.error(res, 'Doctor profile not found', 404);
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctorId: doctor._id
  });

  if (!appointment) {
    return ApiResponse.error(res, 'Appointment not found or not assigned to you', 404);
  }

  if (doctorDiagnosis !== undefined) appointment.doctorDiagnosis = doctorDiagnosis;
  if (notes !== undefined) appointment.notes = notes;
  if (prescriptions !== undefined && Array.isArray(prescriptions)) {
    appointment.prescriptions = prescriptions;
  }
  if (status) {
    appointment.status = status;
  } else {
    appointment.status = APPOINTMENT_STATUS.COMPLETED;
  }

  await appointment.save();

  return ApiResponse.success(res, appointment, 'Consultation records saved successfully');
});
