const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Fast2SMS Gateway Provider (India)
 * Docs: https://docs.fast2sms.com
 *
 *  - OTP messages  -> route "otp" (Fast2SMS fixed OTP text, cheapest, no DLT template needed)
 *  - Everything else -> route "q" (Quick SMS: reminders, confirmations, etc.)
 *
 * Needs a funded Fast2SMS wallet and API key (FAST2SMS_API_KEY).
 */
class Fast2SMSProvider {
  constructor() {
    this.name = 'fast2sms';
  }

  async sendSMS({ to, message }) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      throw new Error('Fast2SMS credentials (FAST2SMS_API_KEY) are not configured.');
    }

    // Fast2SMS wants a plain 10-digit Indian number (strip +91 / spaces)
    const digits = String(to).replace(/\D/g, '');
    const number = digits.length > 10 ? digits.slice(-10) : digits;

    // Detect OTP messages: "123456 is your One-Time Password ..."
    const otpMatch = /^(\d{4,8})\s+is your One-Time/i.exec(message);

    const payload = otpMatch
      ? { route: 'otp', variables_values: otpMatch[1], numbers: number }
      : { route: 'q', message, language: 'english', flash: 0, numbers: number };

    try {
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
        headers: { authorization: apiKey, 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (!response.data?.return) {
        throw new Error(
          Array.isArray(response.data?.message)
            ? response.data.message.join(', ')
            : response.data?.message || 'Fast2SMS rejected the request'
        );
      }

      const messageId = response.data.request_id || `f2s_${Date.now()}`;
      logger.sms(`Fast2SMS SMS sent to ${to} (RequestId: ${messageId}, route: ${payload.route})`);

      return { provider: 'fast2sms', messageId, status: 'sent', timestamp: new Date() };
    } catch (error) {
      const detail = error.response?.data?.message || error.message;
      logger.error(`Fast2SMS dispatch error for ${to}: ${detail}`);
      throw new Error(detail);
    }
  }
}

module.exports = new Fast2SMSProvider();
