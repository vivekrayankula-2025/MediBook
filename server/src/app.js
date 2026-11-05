const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorHandler = require('./middleware/error');
const ApiResponse = require('./utils/apiResponse');

// Import routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const smsRoutes = require('./routes/smsRoutes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Compression
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'UP',
    system: 'MediBook Smart Hospital Appointment & SMS Gateway API',
    timestamp: new Date(),
    smsProvider: process.env.SMS_PROVIDER || 'mock'
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sms', smsRoutes);

// Catch 404 routes
app.use('*', (req, res) => {
  return ApiResponse.error(
    res,
    `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
    404
  );
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
