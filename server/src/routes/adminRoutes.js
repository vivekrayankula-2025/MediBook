const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getDashboardStats,
  getPatients,
  createDoctor,
  updateDoctor,
  getAllAppointments
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');

const doctorCreationValidation = [
  body('name').trim().notEmpty().withMessage('Doctor full name is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('departmentId').notEmpty().withMessage('Department assignment is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('qualification').trim().notEmpty().withMessage('Qualifications are required'),
  body('consultationFee')
    .isNumeric()
    .withMessage('Consultation fee must be a valid number')
];

// All admin routes require Admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/stats', getDashboardStats);
router.get('/patients', getPatients);
router.get('/appointments', getAllAppointments);

router.post('/doctors', validate(doctorCreationValidation), createDoctor);
router.put('/doctors/:id', updateDoctor);

module.exports = router;
