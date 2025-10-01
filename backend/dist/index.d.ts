/**
 * GrandPro HMSO Backend Server
 * Main entry point for the Express application
 */
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import 'express-async-errors';
export declare const prisma: PrismaClient<{
    log: ("info" | "query" | "warn" | "error")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare const app: Express;
export default app;
//# sourceMappingURL=index.d.ts.map