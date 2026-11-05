const express = require('express');
const router = express.Router();

const {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  updateSchedule,
  getDoctorAppointments,
  updateConsultation
} = require('../controllers/doctorController');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Public search and schedule viewing
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

// Doctor & Admin schedule configuration
router.put('/schedule', protect, authorize(ROLES.DOCTOR, ROLES.ADMIN), updateSchedule);

// Doctor dashboard appointments and clinical consultation notes
router.get(
  '/me/appointments',
  protect,
  authorize(ROLES.DOCTOR),
  getDoctorAppointments
);

router.put(
  '/appointments/:id/consultation',
  protect,
  authorize(ROLES.DOCTOR),
  updateConsultation
);

module.exports = router;
