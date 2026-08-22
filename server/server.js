import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/apiResponse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible frontend loading in dev
  crossOriginEmbedderPolicy: false
}));

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. HTTP Parameter Pollution Protection
app.use(hpp());

// 4. Rate Limiting for DDoS / Brute-force Prevention
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again later.'
  }
});
app.use('/api', limiter);

// 5. Body Parsers with payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Base & Health Check Route
app.get('/api/health', (req, res) => {
  successResponse(res, 200, 'MedVault Secure API is fully operational', {
    status: 'HEALTHY',
    version: '1.0.0',
    uptime: process.uptime(),
    security: {
      helmet: 'ACTIVE',
      rateLimiting: 'ACTIVE',
      cors: 'RESTRICTED',
      hpp: 'ACTIVE'
    }
  });
});

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

// Start server if not running in test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  MEDVAULT SECURE API SERVER RUNNING ON PORT ${PORT}`);
    console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Security    : Helmet, CORS, RateLimit, HPP enabled`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
