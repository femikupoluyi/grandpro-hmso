/**
 * Authentication and Authorization Middleware
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map