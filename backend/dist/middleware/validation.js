"use strict";
/**
 * Request Validation Middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = exports.validateRequest = void 0;
const validateRequest = (req, res, next) => {
    // This is a placeholder for request validation
    // In production, you would validate against specific schemas
    next();
};
exports.validateRequest = validateRequest;
// Error handler for Zod validation errors
const handleValidationError = (error) => {
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
exports.handleValidationError = handleValidationError;
//# sourceMappingURL=validation.js.map