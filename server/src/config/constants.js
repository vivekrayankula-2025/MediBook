/**
 * System-wide constants for MediBook
 */
module.exports = {
  ROLES: {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin'
  },
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded'
  },
  SMS_TEMPLATES: {
    BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
    APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
    BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
    BOOKING_CANCELLED: 'BOOKING_CANCELLED',
    STATUS_UPDATE: 'STATUS_UPDATE',
    OPT_OUT_CONFIRMATION: 'OPT_OUT_CONFIRMATION',
    WELCOME_REGISTRATION: 'WELCOME_REGISTRATION',
    OTP_VERIFICATION: 'OTP_VERIFICATION'
  },
  SMS_STATUS: {
    QUEUED: 'queued',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    OPTED_OUT: 'opted_out'
  },
     PROVIDERS: {
     MOCK: 'mock',
     TWILIO: 'twilio',
     MSG91: 'msg91',
     FAST2SMS: 'fast2sms',
     NONE: 'none'
   },
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 5,
    RESEND_COOLDOWN_SECONDS: 60,
    PURPOSES: {
      REGISTRATION: 'registration',
      LOGIN: 'login',
      PHONE_VERIFICATION: 'phone_verification',
      PASSWORD_RESET: 'password_reset'
    }
  }

};
