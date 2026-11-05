const logger = require('../../utils/logger');

/**
 * Mock SMS Provider for local development, academic demonstration, and testing
 */
class MockSMSProvider {
  constructor() {
    this.name = 'mock';
  }

  async sendSMS({ to, message }) {
    // Simulate slight carrier latency (50ms)
    await new Promise((res) => setTimeout(res, 50));

    // Simulate carrier delivery failure if test number is 0000000000
    if (to && to.includes('0000000000')) {
      logger.sms(`[MOCK FAIL] Simulated delivery failure to test number: ${to}`);
      throw new Error('Carrier Network Delivery Failure: Subscriber Absent / Number unreachable (Simulated)');
    }

    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    logger.sms(`--- SIMULATED OUTBOUND SMS ---`);
    logger.sms(`Recipient: ${to}`);
    logger.sms(`Message ID: ${messageId}`);
    logger.sms(`Content: ${message}`);
    logger.sms(`Status: DELIVERED (Simulated carrier dispatch)`);
    logger.sms(`---------------------------------`);

    return {
      provider: 'mock',
      messageId,
      status: 'delivered',
      timestamp: new Date()
    };
  }
}

module.exports = new MockSMSProvider();
