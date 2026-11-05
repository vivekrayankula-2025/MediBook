const mongoose = require('mongoose');

const shiftScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6 // 0: Sunday, 1: Monday, ... 6: Saturday
    },
    dayName: {
      type: String,
      required: true
    },
    isWorkingDay: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: String,
      default: '09:00', // HH:MM in 24hr format
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format (HH:MM)']
    },
    endTime: {
      type: String,
      default: '17:00', // HH:MM in 24hr format
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:MM)']
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: [10, 'Slot duration must be at least 10 minutes'],
      max: [120, 'Slot duration cannot exceed 120 minutes']
    },
    breakStartTime: {
      type: String,
      default: '13:00'
    },
    breakEndTime: {
      type: String,
      default: '14:00'
    },
    maxPatientsPerSlot: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please assign a department to the doctor']
    },
    specialization: {
      type: String,
      required: [true, 'Please provide doctor specialization'],
      trim: true
    },
    qualification: {
      type: String,
      required: [true, 'Please provide doctor qualification'],
      trim: true
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please provide experience in years'],
      min: [0, 'Experience years cannot be negative'],
      default: 1
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
      min: [0, 'Consultation fee cannot be negative'],
      default: 500
    },
    bio: {
      type: String,
      trim: true,
      default: 'Dedicated healthcare professional providing compassionate patient care.'
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    roomNumber: {
      type: String,
      default: 'Room 101'
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    ratingsQuantity: {
      type: Number,
      default: 15
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    weeklySchedule: {
      type: [shiftScheduleSchema],
      default: () => [
        { dayOfWeek: 1, dayName: 'Monday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
        { dayOfWeek: 2, dayName: 'Tuesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
        { dayOfWeek: 3, dayName: 'Wednesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
        { dayOfWeek: 4, dayName: 'Thursday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
        { dayOfWeek: 5, dayName: 'Friday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00', maxPatientsPerSlot: 1 },
        { dayOfWeek: 6, dayName: 'Saturday', isWorkingDay: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '', maxPatientsPerSlot: 1 },
        { dayOfWeek: 0, dayName: 'Sunday', isWorkingDay: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '', maxPatientsPerSlot: 1 }
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
