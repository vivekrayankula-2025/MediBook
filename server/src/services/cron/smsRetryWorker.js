const cron = require('node-cron');
const SMSLog = require('../../models/SMSLog');
const smsService = require('../sms/smsService');
const { SMS_STATUS } = require('../../config/constants');
const logger = require('../../utils/logger');

const processFailedSMSQueue = async () => {
  try {
    const failedLogs = await SMSLog.find({
      status: SMS_STATUS.FAILED,
      $expr: { $lt: ['$retryCount', '$maxRetries'] }
    }).limit(20);

    if (failedLogs.length === 0) return;

    logger.sms(`Processing ${failedLogs.length} failed SMS log(s) for automated retry...`);

    for (const log of failedLogs) {
      logger.sms(`Retrying dispatch for SMS Log ID: ${log._id} (Attempt ${log.retryCount + 1}/${log.maxRetries})`);
      await smsService.retryFailedSMS(log._id);
    }
  } catch (error) {
    logger.error('Error in SMS retry worker execution:', error.message);
  }
};

const initSMSRetryWorker = () => {
  const schedule = process.env.SMS_RETRY_CRON_SCHEDULE || '*/10 * * * *';
  cron.schedule(schedule, () => {
    processFailedSMSQueue();
  });
  logger.info(`SMS Retry Worker scheduled with pattern: "${schedule}"`);
};

module.exports = { initSMSRetryWorker, processFailedSMSQueue };
