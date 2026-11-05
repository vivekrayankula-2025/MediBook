const express = require('express');
const router = express.Router();

const {
  getSMSLogs,
  retrySMS,
  handleWebhook,
  getSMSStats
} = require('../controllers/smsController');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Public Webhook for Inbound SMS / Delivery receipts (e.g. Twilio / MSG91 webhook)
router.post('/webhook', handleWebhook);

// Admin-protected audit & control endpoints
router.get('/logs', protect, authorize(ROLES.ADMIN), getSMSLogs);
router.get('/stats', protect, authorize(ROLES.ADMIN), getSMSStats);
router.post('/retry/:id', protect, authorize(ROLES.ADMIN), retrySMS);

module.exports = router;
