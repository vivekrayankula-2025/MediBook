const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { APPOINTMENT_STATUS } = require('../config/constants');

/**
 * Parses time "HH:MM" into total minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Formats total minutes from midnight into "HH:MM"
 */
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

class SlotService {
  /**
   * Generates time slots for a given doctor on a given date (YYYY-MM-DD),
   * dynamically cross-referencing existing booked appointments to prevent double booking.
   */
  async getAvailableSlotsForDoctor(doctorId, dateString) {
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email phone');
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (!doctor.isAvailable) {
      return {
        date: dateString,
        doctor: { id: doctor._id, name: doctor.userId.name },
        isWorkingDay: false,
        message: 'Doctor is currently on leave or unavailable',
        slots: []
      };
    }

    // Determine day of week from YYYY-MM-DD
    // Note: append 'T00:00:00' to parse in local context reliably
    const [year, month, day] = dateString.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...

    // Find schedule configuration for this day of week
    const daySchedule = doctor.weeklySchedule.find(
      (sch) => sch.dayOfWeek === dayOfWeek
    );

    if (!daySchedule || !daySchedule.isWorkingDay) {
      return {
        date: dateString,
        doctor: { id: doctor._id, name: doctor.userId?.name },
        isWorkingDay: false,
        message: `Doctor does not hold clinic sessions on ${daySchedule ? daySchedule.dayName : 'this day'}`,
        slots: []
      };
    }

    // Generate potential slots based on shift hours and slot duration
    const startMins = timeToMinutes(daySchedule.startTime);
    const endMins = timeToMinutes(daySchedule.endTime);
    const slotDuration = daySchedule.slotDurationMinutes || 30;

    let breakStartMins = -1;
    let breakEndMins = -1;
    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
      breakStartMins = timeToMinutes(daySchedule.breakStartTime);
      breakEndMins = timeToMinutes(daySchedule.breakEndTime);
    }

    const potentialSlots = [];
    let current = startMins;

    while (current + slotDuration <= endMins) {
      const slotStart = current;
      const slotEnd = current + slotDuration;

      // Skip slots that overlap with break time
      const overlapsBreak =
        breakStartMins !== -1 &&
        breakEndMins !== -1 &&
        slotStart < breakEndMins &&
        slotEnd > breakStartMins;

      if (!overlapsBreak) {
        potentialSlots.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd)
        });
      }

      current += slotDuration;
    }

    // Query active booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: dateString,
      status: {
        $in: [
          APPOINTMENT_STATUS.PENDING,
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.RESCHEDULED
        ]
      }
    }).select('timeSlot status bookingReference');

    // Create a Set of already booked slot start times
    const bookedStartTimes = new Set(
      bookedAppointments.map((app) => app.timeSlot.startTime)
    );

    // Annotate each slot with availability status
    const annotatedSlots = potentialSlots.map((slot) => {
      const isBooked = bookedStartTimes.has(slot.startTime);
      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !isBooked,
        isBooked
      };
    });

    return {
      date: dateString,
      doctor: {
        id: doctor._id,
        name: doctor.userId?.name,
        specialization: doctor.specialization,
        roomNumber: doctor.roomNumber,
        consultationFee: doctor.consultationFee
      },
      dayName: daySchedule.dayName,
      isWorkingDay: true,
      totalSlots: annotatedSlots.length,
      availableSlotsCount: annotatedSlots.filter((s) => s.isAvailable).length,
      slots: annotatedSlots
    };
  }
}

module.exports = new SlotService();
