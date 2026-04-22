import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function addAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function removeAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function markFullDayUnavailable(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=availability.controller.d.ts.map