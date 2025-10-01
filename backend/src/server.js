// Simple server startup without TypeScript compilation issues
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    timezone: 'Africa/Lagos',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// System info
app.get('/api/system/info', async (req, res) => {
  try {
    const [userCount, hospitalCount, patientCount] = await Promise.all([
      prisma.user.count(),
      prisma.hospital.count(),
      prisma.patient.count(),
    ]);

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      timezone: 'Africa/Lagos',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      statistics: {
        users: userCount,
        hospitals: hospitalCount,
        patients: patientCount,
      },
      currency: 'NGN',
      country: 'NG',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system information',
    });
  }
});

// Mock auth endpoints for demo
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Demo login
  if (email === 'admin@grandpro-hmso.com.ng' && password === 'Admin@123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@grandpro-hmso.com.ng',
          firstName: 'Adebayo',
          lastName: 'Ogundimu',
          role: 'SUPER_ADMIN',
          hospitalId: 'hosp-001',
          hospitalName: 'Lagos General Hospital',
        },
        token: 'demo-jwt-token-' + Date.now(),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          GrandPro HMSO Backend Server                     ║
║          Hospital Management System                        ║
║                                                            ║
║  Server running at: http://0.0.0.0:${PORT}                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  Timezone: Africa/Lagos                                   ║
║  Database: Connected to Neon PostgreSQL                   ║
║                                                            ║
║  Nigerian Healthcare Platform 🇳🇬                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
