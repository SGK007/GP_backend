import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function acceptBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function rejectBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getUserBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getLawyerBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=booking.controller.d.ts.map