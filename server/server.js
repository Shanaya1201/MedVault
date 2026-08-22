import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/apiResponse.js';
import { initializeSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false,
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

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
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

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  successResponse(res, 200, 'MedVault Secure API & Real-Time Telemetry Operational', {
    status: 'HEALTHY',
    version: '1.0.0',
    uptime: process.uptime(),
    security: {
      jwt: 'ENABLED',
      rbac: 'ENABLED',
      messaging: 'ENABLED',
      websocket: 'ENABLED',
      helmet: 'ACTIVE'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Auto-start if executed directly (e.g. `node server.js`)
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution) {
  httpServer.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  MEDVAULT FULL-STACK API & WEBSOCKET ENGINE`);
    console.log(`  HTTP Port   : ${PORT}`);
    console.log(`  WebSocket   : ws://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export { app, httpServer, io };
export default app;
