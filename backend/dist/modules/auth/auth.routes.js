"use strict";
/**
 * Authentication Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
const validation_1 = require("../../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', validation_1.validateRequest, auth_controller_1.authController.login);
router.post('/register', validation_1.validateRequest, auth_controller_1.authController.register);
router.get('/verify-email/:token', auth_controller_1.authController.verifyEmail);
router.post('/forgot-password', validation_1.validateRequest, auth_controller_1.authController.forgotPassword);
router.post('/reset-password', validation_1.validateRequest, auth_controller_1.authController.resetPassword);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/logout', auth_controller_1.authController.logout);
router.get('/me', auth_controller_1.authController.getCurrentUser);
router.put('/profile', validation_1.validateRequest, auth_controller_1.authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map