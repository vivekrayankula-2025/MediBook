const logger = require('../../utils/logger');

/**
 * Twilio SMS Gateway Provider
 */
class TwilioProvider {
  constructor() {
    this.name = 'twilio';
    this.client = null;
    this.init();
  }

  init() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && !accountSid.startsWith('AC_DEMO')) {
      try {
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
        logger.info('Twilio SMS Client initialized successfully.');
      } catch (err) {
        logger.warn('Failed to initialize Twilio client:', err.message);
      }
    }
  }

  async sendSMS({ to, message }) {
    if (!this.client) {
      this.init();
    }

    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!this.client || !from) {
      throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not configured.');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from,
        to
      });

      logger.sms(`Twilio SMS sent to ${to} (SID: ${result.sid}, Status: ${result.status})`);

      return {
        provider: 'twilio',
        messageId: result.sid,
        status: result.status === 'failed' ? 'failed' : 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Twilio dispatch error for ${to}:`, error.message);
      throw error;
    }
  }
}

module.exports = new TwilioProvider();
