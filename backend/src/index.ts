/**
 * GrandPro HMSO Backend Server
 * Main entry point for the Express application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express application
const app: Express = express();

// Set timezone to Nigerian time
process.env.TZ = process.env.TIMEZONE || 'Africa/Lagos';

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ,
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// Database health check
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// System information endpoint (for admin dashboard)
app.get('/api/system/info', async (req: Request, res: Response) => {
  try {
    // Get database statistics
    const [userCount, hospitalCount, patientCount] = await Promise.all([
      prisma.user.count(),
      prisma.hospital.count(),
      prisma.patient.count(),
    ]);

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      timezone: process.env.TZ,
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      statistics: {
        users: userCount,
        hospitals: hospitalCount,
        patients: patientCount,
      },
      currency: process.env.CURRENCY || 'NGN',
      country: process.env.COUNTRY_CODE || 'NG',
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system information',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================
// API ROUTES
// ============================================

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';

// Authentication routes
app.use('/api/auth', authRoutes);

// Hospital onboarding routes
app.use('/api/onboarding', onboardingRoutes);

// CRM routes
app.use('/api/crm', (req: Request, res: Response) => {
  res.json({ message: 'CRM module - To be implemented' });
});

// Hospital management routes
app.use('/api/hospital', (req: Request, res: Response) => {
  res.json({ message: 'Hospital management module - To be implemented' });
});

// Operations center routes
app.use('/api/operations', (req: Request, res: Response) => {
  res.json({ message: 'Operations module - To be implemented' });
});

// Partner integration routes
app.use('/api/partners', (req: Request, res: Response) => {
  res.json({ message: 'Partners module - To be implemented' });
});

// Analytics routes
app.use('/api/analytics', (req: Request, res: Response) => {
  res.json({ message: 'Analytics module - To be implemented' });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = parseInt(process.env.PORT || '5000');
const HOST = process.env.HOST || '0.0.0.0';

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          GrandPro HMSO Backend Server                     ║
║          Hospital Management System                        ║
║                                                            ║
║  Server running at: http://${HOST}:${PORT}                    ║
║  Environment: ${process.env.NODE_ENV}                          ║
║  Timezone: ${process.env.TZ}                                   ║
║  Database: Connected to Neon PostgreSQL                   ║
║                                                            ║
║  Nigerian Healthcare Platform 🇳🇬                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  console.log('Available endpoints:');
  console.log(`  Health Check: http://${HOST}:${PORT}/health`);
  console.log(`  Database Check: http://${HOST}:${PORT}/health/db`);
  console.log(`  System Info: http://${HOST}:${PORT}/api/system/info`);
});

export default app;
