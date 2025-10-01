/**
 * Request Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleValidationError: (error: ZodError) => {
    success: boolean;
    message: string;
    errors: {
        field: string;
        message: string;
    }[];
};
//# sourceMappingURL=validation.d.ts.map