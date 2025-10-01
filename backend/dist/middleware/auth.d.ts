import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
            session?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map