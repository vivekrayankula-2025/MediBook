const cron = require('node-cron');
const Appointment = require('../../models/Appointment');
const smsService = require('../sms/smsService');
const { SMS_TEMPLATES, APPOINTMENT_STATUS } = require('../../config/constants');
const logger = require('../../utils/logger');

/**
 * Calculates tomorrow's date formatted as YYYY-MM-DD
 */
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sendAppointmentReminders = async () => {
  try {
    const targetDate = getTomorrowDateString();
    logger.info(`Running Appointment Reminder Cron for target date: ${targetDate}`);

    const upcomingAppointments = await Appointment.find({
      appointmentDate: targetDate,
      status: APPOINTMENT_STATUS.CONFIRMED,
      'smsDeliveryStatus.reminderSent': false
    })
      .populate('patientId', 'name phone email smsConsent')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('departmentId', 'name');

    logger.info(`Found ${upcomingAppointments.length} appointments requiring SMS reminder.`);

    for (const appt of upcomingAppointments) {
      if (!appt.patientId || !appt.doctorId) continue;

      try {
        await smsService.sendNotification({
          patientId: appt.patientId._id,
          recipientPhone: appt.patientId.phone,
          appointmentId: appt._id,
          templateType: SMS_TEMPLATES.APPOINTMENT_REMINDER,
          templateParams: {
            patientName: appt.patientId.name,
            doctorName: appt.doctorId.userId?.name || 'Doctor',
            appointmentDate: appt.appointmentDate,
            timeSlot: `${appt.timeSlot.startTime} - ${appt.timeSlot.endTime}`,
            bookingRef: appt.bookingReference
          }
        });
      } catch (smsErr) {
        logger.error(`Reminder failed for appointment ${appt.bookingReference}: ${smsErr.message}`);
      }
    }
  } catch (err) {
    logger.error('Error during reminder cron execution:', err.message);
  }
};

const initReminderCron = () => {
  const schedule = process.env.REMINDER_CRON_SCHEDULE || '0 * * * *';
  cron.schedule(schedule, () => {
    sendAppointmentReminders();
  });
  logger.info(`Appointment Reminder Cron scheduled with pattern: "${schedule}"`);
};

module.exports = { initReminderCron, sendAppointmentReminders };
