const SMSLog = require('../../models/SMSLog');
const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const { SMS_STATUS, PROVIDERS, SMS_TEMPLATES } = require('../../config/constants');
const { buildMessage } = require('./templates');
const mockProvider = require('./mockProvider');
const twilioProvider = require('./twilioProvider');
const msg91Provider = require('./msg91Provider');
const fast2smsProvider = require('./fast2smsProvider');
const logger = require('../../utils/logger');

class SMSService {
  /**
   * Resolves the configured active SMS provider
   */
  getProvider() {
    const configuredProvider = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

    if (configuredProvider === PROVIDERS.TWILIO) {
      if (
        process.env.TWILIO_ACCOUNT_SID &&
        !process.env.TWILIO_ACCOUNT_SID.startsWith('AC_DEMO')
      ) {
        return twilioProvider;
      }
      logger.warn('Twilio credentials not configured. Falling back to Mock SMS Provider.');
      return mockProvider;
    }

    if (configuredProvider === PROVIDERS.FAST2SMS) {
      if (process.env.FAST2SMS_API_KEY) {
        return fast2smsProvider;
      }
      logger.warn('Fast2SMS API key not configured. Falling back to Mock SMS Provider.');
      return mockProvider;
    }

    if (configuredProvider === PROVIDERS.MSG91) {
      if (
        process.env.MSG91_AUTH_KEY &&
        !process.env.MSG91_AUTH_KEY.startsWith('demo')
      ) {
        return msg91Provider;
      }
      logger.warn('MSG91 credentials not configured. Falling back to Mock SMS Provider.');
      return mockProvider;
    }

    return mockProvider;
  }

  /**
   * Sends an SMS notification according to template and patient consent
   */
  async sendNotification({
    patientId,
    recipientPhone,
    templateType,
    templateParams,
    appointmentId = null,
    metadata = {}
  }) {
    try {
      // 1. Patient Consent Verification (GDPR / TCPA Compliance)
      let patient = null;
      if (patientId) {
        patient = await User.findById(patientId);
      } else if (recipientPhone) {
        patient = await User.findOne({ phone: recipientPhone });
      }

      const phone = recipientPhone || patient?.phone;
      if (!phone) {
        throw new Error('No recipient phone number provided for SMS notification');
      }

      // Check opt-out status
      if (patient && patient.smsConsent === false) {
        logger.info(`SMS skipped: Patient ${patient.name} (${phone}) has opted out of SMS.`);
        
        const optOutLog = await SMSLog.create({
          recipientPhone: phone,
          patientId: patient._id,
          appointmentId,
          templateType,
          messageBody: '[SMS NOT DISPATCHED - PATIENT OPTED OUT]',
          provider: 'none',
          status: SMS_STATUS.OPTED_OUT,
          metadata: { ...metadata, reason: 'Patient opted out of notifications' }
        });

        return {
          success: false,
          optedOut: true,
          logId: optOutLog._id,
          message: 'Patient has opted out of SMS notifications'
        };
      }

      // 2. Build template message text
      const messageBody = buildMessage(templateType, templateParams);

      const provider = this.getProvider();

      // 3. Create initial queued SMS log entry in MongoDB
      const smsLog = await SMSLog.create({
        recipientPhone: phone,
        patientId: patient?._id || null,
        appointmentId,
        templateType,
        messageBody,
        provider: provider.name,
        status: SMS_STATUS.QUEUED,
        retryCount: 0,
        metadata
      });

      // 4. Dispatch SMS via chosen provider
      try {
        const dispatchResult = await provider.sendSMS({
          to: phone,
          message: messageBody
        });

        // 5. Update SMS log on successful dispatch
        smsLog.status = dispatchResult.status || SMS_STATUS.SENT;
        smsLog.providerMessageId = dispatchResult.messageId;
        smsLog.deliveryTimestamp = dispatchResult.timestamp || new Date();
        smsLog.lastAttemptAt = new Date();
        await smsLog.save();

        // 6. Update appointment's embedded sms delivery tracking
        if (appointmentId) {
          await this.updateAppointmentSmsFlag(appointmentId, templateType, smsLog.status);
        }

        return {
          success: true,
          status: smsLog.status,
          logId: smsLog._id,
          messageId: smsLog.providerMessageId
        };
      } catch (dispatchErr) {
        // Handle delivery/network failure
        smsLog.status = SMS_STATUS.FAILED;
        smsLog.retryCount = 1;
        smsLog.lastAttemptAt = new Date();
        smsLog.errorMessage = dispatchErr.message;
        smsLog.errorHistory.push({
          attemptedAt: new Date(),
          error: dispatchErr.message,
          attemptNumber: 1
        });
        await smsLog.save();

        logger.error(`SMS dispatch failed for log ${smsLog._id}: ${dispatchErr.message}`);

        return {
          success: false,
          status: SMS_STATUS.FAILED,
          logId: smsLog._id,
          error: dispatchErr.message
        };
      }
    } catch (error) {
      logger.error('SMS Service unexpected error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper to update delivery flag on the appointment
   */
  async updateAppointmentSmsFlag(appointmentId, templateType, status) {
    try {
      const updateFields = { 'smsDeliveryStatus.lastSmsStatus': status };

      if (templateType === SMS_TEMPLATES.BOOKING_CONFIRMATION) {
        updateFields['smsDeliveryStatus.confirmationSent'] = true;
      } else if (templateType === SMS_TEMPLATES.APPOINTMENT_REMINDER) {
        updateFields['smsDeliveryStatus.reminderSent'] = true;
      } else if (templateType === SMS_TEMPLATES.BOOKING_RESCHEDULED) {
        updateFields['smsDeliveryStatus.rescheduleSent'] = true;
      } else if (templateType === SMS_TEMPLATES.BOOKING_CANCELLED) {
        updateFields['smsDeliveryStatus.cancellationSent'] = true;
      }

      await Appointment.findByIdAndUpdate(appointmentId, { $set: updateFields });
    } catch (err) {
      logger.warn(`Could not update appointment SMS flags: ${err.message}`);
    }
  }

  /**
   * Retry sending a failed SMS log entry
   */
  async retryFailedSMS(smsLogId) {
    const log = await SMSLog.findById(smsLogId);
    if (!log) throw new Error('SMS Log not found');

    if (log.status === SMS_STATUS.DELIVERED || log.status === SMS_STATUS.SENT) {
      return { success: true, message: 'SMS has already been delivered.' };
    }

    if (log.retryCount >= log.maxRetries) {
      return { success: false, message: 'Max retry attempts exceeded.' };
    }

    const provider = this.getProvider();
    log.retryCount += 1;
    log.lastAttemptAt = new Date();

    try {
      const result = await provider.sendSMS({
        to: log.recipientPhone,
        message: log.messageBody
      });

      log.status = result.status || SMS_STATUS.SENT;
      log.providerMessageId = result.messageId;
      log.deliveryTimestamp = new Date();
      log.errorMessage = null;
      await log.save();

      return { success: true, status: log.status };
    } catch (err) {
      log.status = SMS_STATUS.FAILED;
      log.errorMessage = err.message;
      log.errorHistory.push({
        attemptedAt: new Date(),
        error: err.message,
        attemptNumber: log.retryCount
      });
      await log.save();

      return { success: false, error: err.message };
    }
  }

  /**
   * Opt-out a patient by phone or patient ID
   */
  async updateConsent(userId, consent) {
    const user = await User.findByIdAndUpdate(
      userId,
      { smsConsent: consent },
      { new: true }
    );
    if (!user) throw new Error('User not found');

    if (consent === false) {
      logger.info(`Patient ${user.name} (${user.phone}) opted out of SMS.`);
    } else {
      logger.info(`Patient ${user.name} (${user.phone}) opted in to SMS.`);
    }

    return user;
  }
}

module.exports = new SMSService();
