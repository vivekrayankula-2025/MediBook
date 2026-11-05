const mongoose = require('mongoose');
const { SMS_TEMPLATES, SMS_STATUS, PROVIDERS } = require('../config/constants');

const smsLogSchema = new mongoose.Schema(
  {
    recipientPhone: {
      type: String,
      required: [true, 'Recipient phone number is required'],
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true
    },
    templateType: {
      type: String,
      enum: Object.values(SMS_TEMPLATES),
      required: true
    },
    messageBody: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: Object.values(PROVIDERS),
      required: true,
      default: PROVIDERS.MOCK
    },
    providerMessageId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(SMS_STATUS),
      default: SMS_STATUS.QUEUED,
      index: true
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now
    },
    deliveryTimestamp: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    errorHistory: [
      {
        attemptedAt: { type: Date, default: Date.now },
        error: String,
        attemptNumber: Number
      }
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup and retry worker queries
smsLogSchema.index({ status: 1, retryCount: 1, createdAt: -1 });

module.exports = mongoose.model('SMSLog', smsLogSchema);
