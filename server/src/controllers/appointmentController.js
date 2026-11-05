const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const User = require('../models/User');
const SMSLog = require('../models/SMSLog');
const smsService = require('../services/sms/smsService');
const { APPOINTMENT_STATUS, SMS_TEMPLATES, ROLES } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// @desc    Book a new hospital appointment
// @route   POST /api/appointments
// @access  Private (Patient or Admin)
exports.bookAppointment = asyncHandler(async (req, res) => {
  const {
    doctorId,
    appointmentDate,
    timeSlot,
    reasonForVisit,
    paymentMethod = 'pay_at_clinic',
    notes = ''
  } = req.body;

  // Patient is the logged-in user unless Admin creates appointment on behalf of another patient
  let patientId = req.user._id;
  if (req.user.role === ROLES.ADMIN && req.body.patientId) {
    patientId = req.body.patientId;
  }

  // 1. Validate Doctor
  const doctor = await Doctor.findById(doctorId).populate('userId', 'name phone email').populate('departmentId');
  if (!doctor || !doctor.isAvailable) {
    return ApiResponse.error(res, 'Doctor is not available for bookings.', 404);
  }

  // 2. Validate Patient
  const patient = await User.findById(patientId);
  if (!patient) {
    return ApiResponse.error(res, 'Patient profile not found.', 404);
  }

  // 3. Pre-check for duplicate slot (code-level check before database insertion)
  const existingActive = await Appointment.findOne({
    doctorId,
    appointmentDate,
    'timeSlot.startTime': timeSlot.startTime,
    status: {
      $in: [
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.RESCHEDULED
      ]
    }
  });

  if (existingActive) {
    return ApiResponse.error(
      res,
      'This appointment slot is already reserved by another patient. Please select a different time slot.',
      409
    );
  }

  // 4. ATOMIC CREATION: Mongoose schema has partial compound unique index
  // which will block any concurrent race condition at the DB storage engine level
  let appointment;
  try {
    appointment = await Appointment.create({
      patientId,
      doctorId,
      departmentId: doctor.departmentId._id,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      consultationFee: doctor.consultationFee,
      paymentMethod,
      notes,
      status: APPOINTMENT_STATUS.CONFIRMED
    });
  } catch (err) {
    if (err.code === 11000) {
      return ApiResponse.error(
        res,
        'This appointment slot was just taken by another patient milliseconds ago. Please select another slot.',
        409
      );
    }
    throw err;
  }

  // 5. DISPATCH REAL-TIME SMS CONFIRMATION
  // Non-blocking trigger: send SMS and record audit log
  smsService
    .sendNotification({
      patientId: patient._id,
      recipientPhone: patient.phone,
      appointmentId: appointment._id,
      templateType: SMS_TEMPLATES.BOOKING_CONFIRMATION,
      templateParams: {
        patientName: patient.name,
        doctorName: doctor.userId?.name || 'Specialist',
        departmentName: doctor.departmentId?.name || 'Clinic',
        appointmentDate: appointment.appointmentDate,
        timeSlot: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
        bookingRef: appointment.bookingReference
      }
    })
    .catch((smsErr) => {
      logger.error(`SMS Confirmation failed for booking ${appointment.bookingReference}: ${smsErr.message}`);
    });

  // Populate references for return response
  await appointment.populate([
    { path: 'doctorId', populate: { path: 'userId', select: 'name phone email' } },
    { path: 'departmentId', select: 'name code roomLocation' },
    { path: 'patientId', select: 'name phone email age gender' }
  ]);

  return ApiResponse.created(
    res,
    appointment,
    'Appointment booked successfully! SMS confirmation dispatched to registered mobile number.'
  );
});

// @desc    Get appointments for the logged-in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
exports.getPatientAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { patientId: req.user._id };

  if (status) {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone email' }
    })
    .populate('departmentId', 'name code roomLocation')
    .sort({ appointmentDate: -1, 'timeSlot.startTime': -1 });

  return ApiResponse.success(res, appointments);
});

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone email' }
    })
    .populate('departmentId', 'name code roomLocation description')
    .populate('patientId', 'name email phone age gender bloodGroup emergencyContact address');

  if (!appointment) {
    return ApiResponse.error(res, 'Appointment not found', 404);
  }

  // Authorization check: patient can only view their own, doctor can view theirs, admin can view all
  if (
    req.user.role === ROLES.PATIENT &&
    appointment.patientId._id.toString() !== req.user._id.toString()
  ) {
    return ApiResponse.error(res, 'Not authorized to view this appointment', 403);
  }

  // Retrieve related SMS delivery logs
  const smsLogs = await SMSLog.find({ appointmentId: appointment._id }).sort({ createdAt: -1 });

  return ApiResponse.success(res, {
    appointment,
    smsLogs
  });
});

// @desc    Reschedule an existing appointment
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private (Patient, Doctor, Admin)
exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { newDate, newTimeSlot, reason } = req.body;

  if (!newDate || !newTimeSlot || !newTimeSlot.startTime || !newTimeSlot.endTime) {
    return ApiResponse.error(res, 'New appointment date and time slot are required.', 400);
  }

  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name phone email')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone' }
    });

  if (!appointment) {
    return ApiResponse.error(res, 'Appointment not found', 404);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    return ApiResponse.error(res, 'Cannot reschedule a cancelled appointment.', 400);
  }

  // Check if target slot is already occupied
  const slotConflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: appointment.doctorId._id,
    appointmentDate: newDate,
    'timeSlot.startTime': newTimeSlot.startTime,
    status: {
      $in: [
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.RESCHEDULED
      ]
    }
  });

  if (slotConflict) {
    return ApiResponse.error(
      res,
      'The selected new time slot is already booked. Please choose another slot.',
      409
    );
  }

  // Record history
  appointment.rescheduledHistory.push({
    previousDate: appointment.appointmentDate,
    previousSlot: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
    rescheduledAt: new Date(),
    rescheduledBy: req.user.role
  });

  // Apply new date and slot
  appointment.appointmentDate = newDate;
  appointment.timeSlot = newTimeSlot;
  appointment.status = APPOINTMENT_STATUS.RESCHEDULED;

  await appointment.save();

  // Send Reschedule SMS Notification
  smsService
    .sendNotification({
      patientId: appointment.patientId._id,
      recipientPhone: appointment.patientId.phone,
      appointmentId: appointment._id,
      templateType: SMS_TEMPLATES.BOOKING_RESCHEDULED,
      templateParams: {
        patientName: appointment.patientId.name,
        doctorName: appointment.doctorId.userId?.name || 'Doctor',
        newDate,
        newTimeSlot: `${newTimeSlot.startTime} - ${newTimeSlot.endTime}`,
        bookingRef: appointment.bookingReference
      }
    })
    .catch((err) => {
      logger.error(`SMS Reschedule notification failed: ${err.message}`);
    });

  return ApiResponse.success(res, appointment, 'Appointment rescheduled successfully.');
});

// @desc    Cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (Patient, Doctor, Admin)
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const { reason = 'Cancelled per user request' } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name phone email')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone' }
    });

  if (!appointment) {
    return ApiResponse.error(res, 'Appointment not found', 404);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    return ApiResponse.error(res, 'Appointment is already cancelled.', 400);
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancelledBy = req.user.role;
  appointment.cancellationReason = reason;

  await appointment.save();

  // Send Cancellation SMS Notification
  smsService
    .sendNotification({
      patientId: appointment.patientId._id,
      recipientPhone: appointment.patientId.phone,
      appointmentId: appointment._id,
      templateType: SMS_TEMPLATES.BOOKING_CANCELLED,
      templateParams: {
        patientName: appointment.patientId.name,
        doctorName: appointment.doctorId.userId?.name || 'Doctor',
        appointmentDate: appointment.appointmentDate,
        timeSlot: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
        bookingRef: appointment.bookingReference,
        reason
      }
    })
    .catch((err) => {
      logger.error(`SMS Cancellation notification failed: ${err.message}`);
    });

  return ApiResponse.success(res, appointment, 'Appointment cancelled successfully.');
});

// @desc    Approve / Confirm a pending appointment
// @route   PATCH /api/appointments/:id/approve
// @access  Private (Doctor, Admin)
exports.approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name phone email')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name phone' }
    });

  if (!appointment) {
    return ApiResponse.error(res, 'Appointment not found', 404);
  }

  appointment.status = APPOINTMENT_STATUS.CONFIRMED;
  await appointment.save();

  // Send status update SMS
  smsService
    .sendNotification({
      patientId: appointment.patientId._id,
      recipientPhone: appointment.patientId.phone,
      appointmentId: appointment._id,
      templateType: SMS_TEMPLATES.STATUS_UPDATE,
      templateParams: {
        patientName: appointment.patientId.name,
        doctorName: appointment.doctorId.userId?.name || 'Doctor',
        status: 'CONFIRMED',
        bookingRef: appointment.bookingReference
      }
    })
    .catch((err) => {
      logger.error(`Status update SMS failed: ${err.message}`);
    });

  return ApiResponse.success(res, appointment, 'Appointment confirmed successfully.');
});
