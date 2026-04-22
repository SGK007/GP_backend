import { Request, Response, NextFunction } from 'express';
export interface LawyerRankingScore {
    lawyerId: string;
    lawyerName: string;
    specialization: string;
    city: string;
    profilePicture?: string | null;
    bookingCount: number;
    acceptanceRate: number;
    rating: number;
    overallScore: number;
    aiSuggestion?: string;
}
interface RankingQuery {
    userId?: string;
    city?: string;
    specialization?: string;
    limit?: number;
    includeAISuggestions?: boolean;
}
/**
 * Rank lawyers for a user based on bookings, acceptance rate, and ratings
 * Can optionally include AI suggestions for ranking
 */
export declare function rankLawyers(req: Request<{}, {}, {}, RankingQuery>, res: Response, next: NextFunction): Promise<void>;
/**
 * Get ranking details for a specific lawyer
 */
export declare function getLawyerRankingDetails(req: Request<{
    lawyerId: string;
}>, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=ranking.controller.d.ts.map