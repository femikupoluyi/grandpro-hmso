"use strict";
/**
 * Authentication and Authorization Middleware
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../index");
// Verify JWT token
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        const token = authHeader.replace('Bearer ', '');
        // Verify token
        let decoded;
        try {
            decoded = verifyToken(token);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
        // Check if session exists
        const session = await index_1.prisma.session.findFirst({
            where: {
                sessionToken: token,
                expires: {
                    gt: new Date(),
                },
            },
        });
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired',
            });
        }
        // Get user
        const user = await index_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive',
            });
        }
        // Attach user info to request
        req.userId = user.id;
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};
exports.authenticate = authenticate;
// Authorization middleware
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = verifyToken(token);
            const session = await index_1.prisma.session.findFirst({
                where: {
                    sessionToken: token,
                    expires: {
                        gt: new Date(),
                    },
                },
            });
            if (session) {
                const user = await index_1.prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                });
                if (user && user.isActive) {
                    req.userId = user.id;
                    req.user = user;
                }
            }
        }
        catch (error) {
            // Ignore token errors for optional auth
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map