import { Request, Response, NextFunction } from 'express';
interface GetLawyersQuery {
    city?: string;
    specialization?: string;
    sortBy?: 'rating' | 'availability';
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
}
export declare function getAllLawyers(req: Request<{}, {}, {}, GetLawyersQuery>, res: Response, next: NextFunction): Promise<void>;
export declare function getLawyerById(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=lawyer.controller.d.ts.map