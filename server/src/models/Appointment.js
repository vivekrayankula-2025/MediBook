const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, PAYMENT_STATUS } = require('../config/constants');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, 'Slot start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'Slot end time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)']
    }
  },
  { _id: false }
);

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g. "500mg"
    frequency: { type: String, required: true }, // e.g. "Twice a day after food"
    duration: { type: String, required: true }, // e.g. "5 days"
    instructions: { type: String, default: '' }
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
      index: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID is required']
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true
    },
    timeSlot: {
      type: timeSlotSchema,
      required: [true, 'Appointment time slot is required']
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.CONFIRMED,
      index: true
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Please provide the reason for your appointment'],
      trim: true
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    paymentMethod: {
      type: String,
      enum: ['pay_at_clinic', 'online_card', 'upi', 'insurance'],
      default: 'pay_at_clinic'
    },
    notes: {
      type: String,
      default: ''
    },
    doctorDiagnosis: {
      type: String,
      default: ''
    },
    prescriptions: {
      type: [prescriptionItemSchema],
      default: []
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', null],
      default: null
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    rescheduledHistory: [
      {
        previousDate: String,
        previousSlot: String,
        rescheduledAt: { type: Date, default: Date.now },
        rescheduledBy: String
      }
    ],
    smsDeliveryStatus: {
      confirmationSent: { type: Boolean, default: false },
      reminderSent: { type: Boolean, default: false },
      rescheduleSent: { type: Boolean, default: false },
      cancellationSent: { type: Boolean, default: false },
      lastSmsStatus: { type: String, default: 'none' }
    }
  },
  {
    timestamps: true
  }
);

/**
 * ATOMIC DOUBLE-BOOKING PREVENTION UNIQUE COMPOUND INDEX
 * Ensures that no two active appointments (pending, confirmed, rescheduled)
 * can ever be booked for the same doctor at the same date and slot start time.
 */
appointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    'timeSlot.startTime': 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          APPOINTMENT_STATUS.PENDING,
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.RESCHEDULED
        ]
      }
    },
    name: 'prevent_doctor_slot_double_booking'
  }
);

// Auto-generate booking reference before save if not present
appointmentSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = this.appointmentDate.replace(/-/g, '');
    this.bookingReference = `MDB-${dateStr}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
