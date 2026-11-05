require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryMongoServer = null;

/**
 * Connects to MongoDB using MONGODB_URI from server/.env
 *
 *  - Atlas (cloud):  mongodb+srv://<db_username>:<db_password>@<cluster>.mongodb.net/medibook?retryWrites=true&w=majority
 *  - Local:          mongodb://127.0.0.1:27017/medibook
 *
 * If MONGODB_URI is set, we ALWAYS use it and fail loudly if it cannot connect
 * (so data is never silently written to a throw-away in-memory database).
 * The embedded in-memory fallback is used only in development when MONGODB_URI is not set.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      if (uri.includes('<') || uri.includes('>')) {
        throw new Error(
          'MONGODB_URI still contains placeholders like <db_username>/<db_password>. ' +
            'Replace them with your real MongoDB Atlas database user and password in server/.env'
        );
      }

      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      logger.success(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production.');
    }

    logger.warn('MONGODB_URI not set. Starting embedded in-memory MongoDB (data will NOT persist)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryMongoServer = await MongoMemoryServer.create();
    const conn = await mongoose.connect(memoryMongoServer.getUri());
    logger.success('Embedded MongoDB Memory Server connected');
    return conn;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    if (/bad auth|authentication failed/i.test(error.message)) {
      logger.error('Check the Atlas database username/password (special characters in the password must be URL-encoded).');
    } else if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|Server selection timed out/i.test(error.message)) {
      logger.error('Check the cluster address and that your IP is allowed in Atlas > Network Access.');
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryMongoServer) {
    await memoryMongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
