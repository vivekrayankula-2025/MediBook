const SMSLog = require('../models/SMSLog');
const User = require('../models/User');
const smsService = require('../services/sms/smsService');
const { SMS_STATUS } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// @desc    Get paginated SMS audit and delivery tracking logs
// @route   GET /api/sms/logs
// @access  Private (Admin)
exports.getSMSLogs = asyncHandler(async (req, res) => {
  const { status, provider, templateType, phone, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (provider) query.provider = provider;
  if (templateType) query.templateType = templateType;
  if (phone) query.recipientPhone = { $regex: phone, $options: 'i' };

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    SMSLog.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'appointmentId',
        select: 'bookingReference appointmentDate timeSlot status'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    SMSLog.countDocuments(query)
  ]);

  return ApiResponse.success(res, {
    logs,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    }
  });
});

// @desc    Manually trigger retry for a failed SMS message
// @route   POST /api/sms/retry/:id
// @access  Private (Admin)
exports.retrySMS = asyncHandler(async (req, res) => {
  const result = await smsService.retryFailedSMS(req.params.id);

  if (!result.success) {
    return ApiResponse.error(res, result.message || result.error, 400);
  }

  const updatedLog = await SMSLog.findById(req.params.id);
  return ApiResponse.success(res, updatedLog, 'SMS retry initiated successfully');
});

// @desc    Inbound SMS Webhook (Handles STOP / START opt-out commands)
// @route   POST /api/sms/webhook
// @access  Public (Webhook)
exports.handleWebhook = asyncHandler(async (req, res) => {
  // Twilio passes From and Body in POST body; MSG91 passes mobile and message
  const from = req.body.From || req.body.mobile || req.body.phone;
  const body = (req.body.Body || req.body.message || '').trim().toUpperCase();

  logger.sms(`Incoming SMS Webhook received from ${from}: "${body}"`);

  if (!from) {
    return res.status(400).send('Missing sender phone number');
  }

  const cleanPhone = from.replace(/\D/g, '');
  const user = await User.findOne({
    $or: [{ phone: from }, { phone: { $regex: cleanPhone } }]
  });

  if (user) {
    if (body === 'STOP' || body === 'CANCEL' || body === 'UNSUBSCRIBE') {
      user.smsConsent = false;
      await user.save();
      logger.sms(`Patient ${user.name} (${user.phone}) opted out via SMS webhook.`);
    } else if (body === 'START' || body === 'RESUME' || body === 'UNSTOP') {
      user.smsConsent = true;
      await user.save();
      logger.sms(`Patient ${user.name} (${user.phone}) opted in via SMS webhook.`);
    }
  }

  // Twilio expects TwiML XML or plain text 200 OK
  res.type('text/xml');
  return res.send('<Response></Response>');
});

// @desc    Get aggregate SMS gateway statistics
// @route   GET /api/sms/stats
// @access  Private (Admin)
exports.getSMSStats = asyncHandler(async (req, res) => {
  const [total, delivered, sent, failed, optedOut] = await Promise.all([
    SMSLog.countDocuments({}),
    SMSLog.countDocuments({ status: SMS_STATUS.DELIVERED }),
    SMSLog.countDocuments({ status: SMS_STATUS.SENT }),
    SMSLog.countDocuments({ status: SMS_STATUS.FAILED }),
    SMSLog.countDocuments({ status: SMS_STATUS.OPTED_OUT })
  ]);

  const activeProvider = process.env.SMS_PROVIDER || 'mock';

  return ApiResponse.success(res, {
    activeProvider,
    total,
    delivered,
    sent,
    failed,
    optedOut,
    deliveryRate: total > 0 ? Math.round(((delivered + sent) / total) * 100) : 100
  });
});
