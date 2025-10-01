/**
 * Role-Based Access Control Middleware
 * Authorization based on user roles and permissions
 */

import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

// Define permission structure
interface Permission {
  resource: string;
  action: string;
}

// Define role permissions
const rolePermissions: { [key: string]: Permission[] } = {
  SUPER_ADMIN: [
    { resource: '*', action: '*' } // Full access
  ],
  ADMIN: [
    { resource: 'onboarding', action: 'read' },
    { resource: 'onboarding', action: 'update' },
    { resource: 'onboarding', action: 'evaluate' },
    { resource: 'onboarding', action: 'manage' },
    { resource: 'onboarding', action: 'verify' },
    { resource: 'onboarding', action: 'export' },
    { resource: 'onboarding', action: 'delete' },
    { resource: 'hospitals', action: 'read' },
    { resource: 'hospitals', action: 'create' },
    { resource: 'hospitals', action: 'update' },
    { resource: 'hospitals', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
  ],
  HOSPITAL_ADMIN: [
    { resource: 'onboarding', action: 'read' },
    { resource: 'hospitals', action: 'read' },
    { resource: 'hospitals', action: 'update' },
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'create' },
    { resource: 'patients', action: 'update' },
    { resource: 'patients', action: 'delete' },
    { resource: 'appointments', action: '*' },
    { resource: 'billing', action: '*' },
    { resource: 'inventory', action: '*' },
    { resource: 'staff', action: '*' },
  ],
  DOCTOR: [
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'update' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' },
    { resource: 'medical-records', action: 'read' },
    { resource: 'medical-records', action: 'create' },
    { resource: 'medical-records', action: 'update' },
    { resource: 'prescriptions', action: 'create' },
  ],
  NURSE: [
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'update' },
    { resource: 'appointments', action: 'read' },
    { resource: 'medical-records', action: 'read' },
    { resource: 'medical-records', action: 'create' },
  ],
  RECEPTIONIST: [
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'create' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'create' },
    { resource: 'appointments', action: 'update' },
  ],
  PATIENT: [
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'create' },
    { resource: 'medical-records', action: 'read' },
    { resource: 'prescriptions', action: 'read' },
    { resource: 'billing', action: 'read' },
  ]
};

/**
 * Check if user has permission
 */
const hasPermission = (
  userRole: string,
  resource: string,
  action: string
): boolean => {
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.some(perm => {
    // Check for wildcard permissions
    if (perm.resource === '*' || perm.action === '*') {
      if (perm.resource === '*' && perm.action === '*') return true;
      if (perm.resource === '*' && perm.action === action) return true;
      if (perm.resource === resource && perm.action === '*') return true;
    }
    
    // Check for exact match
    return perm.resource === resource && perm.action === action;
  });
};

/**
 * Authorization middleware
 */
export const authorize = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      // Check if user has permission
      if (!hasPermission(req.user.role, resource, action)) {
        throw new AuthorizationError(
          `You don't have permission to ${action} ${resource}`
        );
      }

      next();
    } catch (error: any) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Authorization failed'
      });
    }
  };
};

/**
 * Check if user has any of the specified roles
 */
export const hasRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError(
          'You don\'t have the required role for this action'
        );
      }

      next();
    } catch (error: any) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Authorization failed'
      });
    }
  };
};

/**
 * Check if user owns the resource
 */
export const isOwner = (getResourceOwnerId: (req: Request) => string | Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (req.user.id !== ownerId && req.user.role !== 'SUPER_ADMIN') {
        throw new AuthorizationError('You can only access your own resources');
      }

      next();
    } catch (error: any) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Authorization failed'
      });
    }
  };
};
