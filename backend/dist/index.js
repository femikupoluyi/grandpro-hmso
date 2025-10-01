"use strict";
/**
 * GrandPro HMSO Backend Server
 * Main entry point for the Express application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("express-async-errors");
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma Client
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
// Create Express application
const app = (0, express_1.default)();
// Set timezone to Nigerian time
process.env.TZ = process.env.TIMEZONE || 'Africa/Lagos';
// ============================================
// MIDDLEWARE
// ============================================
// Security middleware
app.use((0, helmet_1.default)({
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
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Body parser middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all routes
app.use('/api/', limiter);
// Serve static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================
// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        timezone: process.env.TZ,
        environment: process.env.NODE_ENV,
        version: '1.0.0',
    });
});
// Database health check
app.get('/health/db', async (req, res) => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: 'Database connection failed',
            timestamp: new Date().toISOString(),
        });
    }
});
// System information endpoint (for admin dashboard)
app.get('/api/system/info', async (req, res) => {
    try {
        // Get database statistics
        const [userCount, hospitalCount, patientCount] = await Promise.all([
            exports.prisma.user.count(),
            exports.prisma.hospital.count(),
            exports.prisma.patient.count(),
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
    }
    catch (error) {
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
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const onboarding_routes_1 = __importDefault(require("./modules/onboarding/onboarding.routes"));
// Authentication routes
app.use('/api/auth', auth_routes_1.default);
// Hospital onboarding routes
app.use('/api/onboarding', onboarding_routes_1.default);
// CRM routes
app.use('/api/crm', (req, res) => {
    res.json({ message: 'CRM module - To be implemented' });
});
// Hospital management routes
app.use('/api/hospital', (req, res) => {
    res.json({ message: 'Hospital management module - To be implemented' });
});
// Operations center routes
app.use('/api/operations', (req, res) => {
    res.json({ message: 'Operations module - To be implemented' });
});
// Partner integration routes
app.use('/api/partners', (req, res) => {
    res.json({ message: 'Partners module - To be implemented' });
});
// Analytics routes
app.use('/api/analytics', (req, res) => {
    res.json({ message: 'Analytics module - To be implemented' });
});
// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
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
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await exports.prisma.$disconnect();
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
exports.default = app;
//# sourceMappingURL=index.js.map