/**
 * Authentication and Authorization Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

// Verify JWT token
const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Check if session exists
    const session = await prisma.session.findFirst({
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
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = verifyToken(token);
      
      const session = await prisma.session.findFirst({
        where: {
          sessionToken: token,
          expires: {
            gt: new Date(),
          },
        },
      });

      if (session) {
        const user = await prisma.user.findUnique({
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
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};
