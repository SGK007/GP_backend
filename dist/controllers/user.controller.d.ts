import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map