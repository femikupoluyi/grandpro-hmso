/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import { validateRequest } from '../../middleware/validation';

const router = Router();

// Public routes
router.post('/login', validateRequest, authController.login);
router.post('/register', validateRequest, authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', validateRequest, authController.forgotPassword);
router.post('/reset-password', validateRequest, authController.resetPassword);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/profile', validateRequest, authController.updateProfile);

export default router;
