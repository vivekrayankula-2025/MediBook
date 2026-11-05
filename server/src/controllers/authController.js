const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const smsService = require('../services/sms/smsService');
const otpService = require('../services/otp/otpService');
const { SMS_TEMPLATES, ROLES, OTP } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * Generate signed JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'medibook_super_secret_jwt_key_2026_final_year_project_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    age,
    gender,
    bloodGroup,
    emergencyContact,
    address,
    smsConsent
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'An account with this email already exists.', 409);
  }

  // Create new user (default role is patient)
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.PATIENT,
    age,
    gender,
    bloodGroup,
    emergencyContact,
    address,
    smsConsent: smsConsent !== undefined ? Boolean(smsConsent) : true
  });

  const token = generateToken(user._id);

  // Kick off phone verification OTP in the background. This never blocks or
  // fails registration itself - if SMS dispatch has trouble, the patient can
  // always request a fresh code via POST /api/auth/send-otp.
  otpService
    .sendOtp({ phone: user.phone, purpose: OTP.PURPOSES.REGISTRATION })
    .catch((err) => logger.warn(`Could not send registration OTP to ${user.phone}: ${err.message}`));

  return ApiResponse.created(
    res,
    {
      user,
      token
    },
    'Patient registration successful'
  );
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide both email and password', 400);
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return ApiResponse.error(res, 'Invalid email or password credentials', 401);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Your account has been deactivated. Please contact hospital support.', 403);
  }

  const token = generateToken(user._id);

  let doctorProfile = null;
  if (user.role === ROLES.DOCTOR) {
    doctorProfile = await Doctor.findOne({ userId: user._id }).populate('departmentId');
  }

  return ApiResponse.success(
    res,
    {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        smsConsent: user.smsConsent,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
        address: user.address,
        doctorProfileId: doctorProfile?._id
      },
      token
    },
    'Login successful'
  );
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let doctorProfile = null;
  if (user.role === ROLES.DOCTOR) {
    doctorProfile = await Doctor.findOne({ userId: user._id }).populate('departmentId');
  }

  return ApiResponse.success(res, {
    user,
    doctorProfile
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, age, gender, bloodGroup, emergencyContact, address } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (age !== undefined) user.age = age;
  if (gender) user.gender = gender;
  if (bloodGroup) user.bloodGroup = bloodGroup;
  if (emergencyContact) user.emergencyContact = emergencyContact;
  if (address) user.address = address;

  await user.save();

  return ApiResponse.success(res, user, 'Profile updated successfully');
});

// @desc    Update SMS Consent (Opt-in / Opt-out)
// @route   PATCH /api/auth/sms-consent
// @access  Private
exports.updateSMSConsent = asyncHandler(async (req, res) => {
  const { consent } = req.body;

  if (consent === undefined) {
    return ApiResponse.error(res, 'Consent boolean is required', 400);
  }

  const updatedUser = await smsService.updateConsent(req.user._id, Boolean(consent));

  // If opted out, send one-time confirmation SMS informing them
  if (Boolean(consent) === false) {
    try {
      await smsService.sendNotification({
        patientId: updatedUser._id,
        recipientPhone: updatedUser.phone,
        templateType: SMS_TEMPLATES.OPT_OUT_CONFIRMATION,
        templateParams: { patientName: updatedUser.name },
        metadata: { directOptOutNotice: true }
      });
    } catch (e) {
      // Ignore opt-out confirmation failure
    }
  }

  return ApiResponse.success(
    res,
    {
      smsConsent: updatedUser.smsConsent,
      phone: updatedUser.phone
    },
    updatedUser.smsConsent
      ? 'SMS notifications enabled successfully'
      : 'You have opted out of SMS notifications'
  );
});

// @desc    Generate and send a One-Time Password (OTP) by SMS to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = asyncHandler(async (req, res) => {
  const { phone, purpose } = req.body;

  const result = await otpService.sendOtp({
    phone,
    purpose: purpose || OTP.PURPOSES.PHONE_VERIFICATION
  });

  if (!result.success) {
    return ApiResponse.error(
      res,
      result.message || result.error || 'Failed to send OTP',
      result.cooldown ? 429 : 400
    );
  }

  return ApiResponse.success(
    res,
    {
      otpId: result.otpId,
      expiresAt: result.expiresAt,
      provider: result.provider,
      // Present only outside production - lets the OTP be verified end-to-end
      // without a live SMS gateway (e.g. during local development or grading).
      ...(result.devOtp ? { devOtp: result.devOtp } : {})
    },
    'OTP sent successfully to the provided phone number'
  );
});

// @desc    Verify a previously sent OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, purpose } = req.body;

  const result = await otpService.verifyOtp({
    phone,
    otp,
    purpose: purpose || OTP.PURPOSES.PHONE_VERIFICATION
  });

  if (!result.success) {
    return ApiResponse.error(res, result.message, 400);
  }

  // Mark the account's phone number as verified once a registration /
  // phone-verification OTP has been successfully confirmed.
  if (
    result.purpose === OTP.PURPOSES.REGISTRATION ||
    result.purpose === OTP.PURPOSES.PHONE_VERIFICATION
  ) {
    await User.findOneAndUpdate({ phone }, { phoneVerified: true });
  }

  return ApiResponse.success(res, { phone, purpose: result.purpose }, result.message);
});
