const mongoose = require('mongoose');
const { OTP } = require('../config/constants');

/**
 * Stores hashed OTP codes (never the raw code) for phone verification,
 * registration, login and password-reset flows. Documents are
 * auto-purged by MongoDB's TTL index 1 hour after they expire, so the
 * collection never grows unbounded.
 */
const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    purpose: {
      type: String,
      enum: Object.values(OTP.PURPOSES),
      required: true
    },
    otpHash: {
      type: String,
      required: true,
      select: false
    },
    expiresAt: {
      type: Date,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    maxAttempts: {
      type: Number,
      default: OTP.MAX_ATTEMPTS
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    smsLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SMSLog',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Fast lookup of the most recent OTP for a given phone + purpose
otpSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

// Auto-delete documents ~1 hour after they expire (keeps the collection lean)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Otp', otpSchema);
