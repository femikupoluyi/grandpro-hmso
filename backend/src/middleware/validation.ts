/**
 * Request Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // This is a placeholder for request validation
  // In production, you would validate against specific schemas
  next();
};

// Error handler for Zod validation errors
export const handleValidationError = (error: ZodError) => {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    success: false,
    message: 'Validation failed',
    errors,
  };
};
