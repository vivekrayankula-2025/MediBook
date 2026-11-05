/**
 * SMS Message Templates for MediBook
 */
const { SMS_TEMPLATES } = require('../../config/constants');

const hospitalName = process.env.HOSPITAL_NAME || 'MediBook Central Hospital';
const hospitalHelpline = process.env.HOSPITAL_HELPLINE || '+1-800-555-0199';

const templates = {
  [SMS_TEMPLATES.BOOKING_CONFIRMATION]: ({
    patientName,
    doctorName,
    departmentName,
    appointmentDate,
    timeSlot,
    bookingRef
  }) => {
    return (
      `Hello ${patientName}, your appointment with Dr. ${doctorName} (${departmentName}) ` +
      `at ${hospitalName} is CONFIRMED for ${appointmentDate} at ${timeSlot}. ` +
      `Ref: ${bookingRef}. Helpline: ${hospitalHelpline}. Reply STOP to opt out.`
    );
  },

  [SMS_TEMPLATES.APPOINTMENT_REMINDER]: ({
    patientName,
    doctorName,
    appointmentDate,
    timeSlot,
    bookingRef
  }) => {
    return (
      `REMINDER: Dear ${patientName}, you have an appointment tomorrow (${appointmentDate}) ` +
      `at ${timeSlot} with Dr. ${doctorName} at ${hospitalName}. Ref: ${bookingRef}. ` +
      `Please arrive 15 mins early. Helpline: ${hospitalHelpline}. Reply STOP to opt out.`
    );
  },

  [SMS_TEMPLATES.BOOKING_RESCHEDULED]: ({
    patientName,
    doctorName,
    newDate,
    newTimeSlot,
    bookingRef
  }) => {
    return (
      `NOTICE: Dear ${patientName}, your appointment (Ref: ${bookingRef}) with Dr. ${doctorName} ` +
      `has been RESCHEDULED to ${newDate} at ${newTimeSlot}. ` +
      `Helpline: ${hospitalHelpline}. Reply STOP to opt out.`
    );
  },

  [SMS_TEMPLATES.BOOKING_CANCELLED]: ({
    patientName,
    doctorName,
    appointmentDate,
    timeSlot,
    bookingRef,
    reason
  }) => {
    return (
      `NOTICE: Dear ${patientName}, your appointment (Ref: ${bookingRef}) with Dr. ${doctorName} ` +
      `on ${appointmentDate} at ${timeSlot} has been CANCELLED. Reason: ${reason || 'Per request'}. ` +
      `To rebook, visit our portal or call ${hospitalHelpline}.`
    );
  },

  [SMS_TEMPLATES.STATUS_UPDATE]: ({
    patientName,
    doctorName,
    status,
    bookingRef
  }) => {
    return (
      `Hello ${patientName}, status for appointment ${bookingRef} with Dr. ${doctorName} ` +
      `is now: ${status.toUpperCase()}. Contact: ${hospitalHelpline}.`
    );
  },

  [SMS_TEMPLATES.OPT_OUT_CONFIRMATION]: ({ patientName }) => {
    return (
      `MediBook Alert: Hello ${patientName}, you have successfully opted out of SMS notifications. ` +
      `You can re-enable SMS alerts anytime in your profile dashboard.`
    );
  },

  [SMS_TEMPLATES.OTP_VERIFICATION]: ({ otp, validityMinutes }) => {
    return (
      `${otp} is your One-Time Password (OTP) for ${hospitalName}. ` +
      `It is valid for ${validityMinutes || 5} minutes. ` +
      `Do not share this code with anyone. Helpline: ${hospitalHelpline}.`
    );
  }
};

const buildMessage = (templateType, params) => {
  const templateFn = templates[templateType];
  if (!templateFn) {
    throw new Error(`SMS Template '${templateType}' not found.`);
  }
  return templateFn(params);
};

module.exports = { templates, buildMessage };
