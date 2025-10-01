/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */
import { Request, Response, NextFunction } from 'express';
export declare const authController: {
    login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map