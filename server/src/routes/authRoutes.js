const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  updateSMSConsent,
  sendOtp,
  verifyOtp
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Valid mobile phone number is required for SMS booking notifications')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const sendOtpValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('purpose')
    .optional()
    .isIn(['registration', 'login', 'phone_verification', 'password_reset'])
    .withMessage('Invalid OTP purpose')
];

const verifyOtpValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('otp')
    .trim()
    .isLength({ min: 4, max: 8 })
    .withMessage('A valid OTP code is required'),
  body('purpose')
    .optional()
    .isIn(['registration', 'login', 'phone_verification', 'password_reset'])
    .withMessage('Invalid OTP purpose')
];

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/send-otp', validate(sendOtpValidation), sendOtp);
router.post('/verify-otp', validate(verifyOtpValidation), verifyOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.patch('/sms-consent', protect, updateSMSConsent);

module.exports = router;
