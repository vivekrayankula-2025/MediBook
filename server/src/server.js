require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { initReminderCron } = require('./services/cron/reminderCron');
const { initSMSRetryWorker } = require('./services/cron/smsRetryWorker');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize background automation cron jobs
  initReminderCron();
  initSMSRetryWorker();

  // Start HTTP Listener
  const server = app.listen(PORT, () => {
    logger.success(`====================================================`);
    logger.success(` MediBook Backend API Server running on port ${PORT}`);
    logger.success(` Active Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.success(` SMS Notification Engine: [${(process.env.SMS_PROVIDER || 'mock').toUpperCase()}]`);
    logger.success(` API Health: http://localhost:${PORT}/api/health`);
    logger.success(`====================================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down gracefully...', err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Closing HTTP server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  });
};

startServer();
