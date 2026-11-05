const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * MSG91 SMS Gateway Provider
 */
class MSG91Provider {
  constructor() {
    this.name = 'msg91';
  }

  async sendSMS({ to, message }) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'MDBOOK';
    const route = process.env.MSG91_ROUTE || '4';
    const dltTemplateId = process.env.MSG91_DLT_TE_ID;

    if (!authKey || authKey.startsWith('demo')) {
      throw new Error('MSG91 credentials (MSG91_AUTH_KEY, MSG91_SENDER_ID) are not configured.');
    }

    try {
      // Clean recipient phone (strip non-digits)
      const cleanPhone = to.replace(/\D/g, '');

      const payload = {
        sender: senderId,
        route,
        country: '91',
        sms: [
          {
            message,
            to: [cleanPhone]
          }
        ]
      };

      if (dltTemplateId) {
        payload.DLT_TE_ID = dltTemplateId;
      }

      const response = await axios.post('https://api.msg91.com/api/v2/sendsms', payload, {
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const messageId = response.data?.message || `msg91_${Date.now()}`;
      logger.sms(`MSG91 SMS dispatched to ${to} (MessageId: ${messageId})`);

      return {
        provider: 'msg91',
        messageId,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`MSG91 dispatch error for ${to}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}

module.exports = new MSG91Provider();
