import { Request, Response } from 'express';
export declare const submitApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getApplications: (req: Request, res: Response) => Promise<void>;
export declare const getApplicationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateApplicationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const evaluateApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const generateContract: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signContract: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOnboardingProgress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=onboarding.controller.d.ts.map