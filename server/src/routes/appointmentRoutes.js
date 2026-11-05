const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  bookAppointment,
  getPatientAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  approveAppointment
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');

const bookingValidation = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Appointment date must be formatted as YYYY-MM-DD'),
  body('timeSlot.startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be formatted as HH:MM'),
  body('timeSlot.endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be formatted as HH:MM'),
  body('reasonForVisit')
    .trim()
    .notEmpty()
    .withMessage('Reason for hospital visit is required')
];

// All appointment operations require authentication
router.use(protect);

// Book new appointment
router.post('/', validate(bookingValidation), bookAppointment);

// Patient appointments list
router.get(
  '/my-appointments',
  authorize(ROLES.PATIENT),
  getPatientAppointments
);

// Single appointment details
router.get('/:id', getAppointmentById);

// Actions: Reschedule, Cancel, Approve
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/approve', authorize(ROLES.DOCTOR, ROLES.ADMIN), approveAppointment);

module.exports = router;
