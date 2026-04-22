import express, { Router } from 'express';
import { rankLawyers, getLawyerRankingDetails } from '../controllers/ranking.controller';

const router: Router = express.Router();

/**
 * GET /api/ranking/lawyers
 * Rank all lawyers based on bookings, acceptance rate, and ratings
 * 
 * Query parameters:
 * - city: Filter by city
 * - specialization: Filter by specialization
 * - limit: Number of results to return (default: 20)
 * - includeAISuggestions: Include AI-generated suggestion (default: false)
 * - userId: User ID for AI suggestion context
 */
router.get('/lawyers', rankLawyers);

/**
 * GET /api/ranking/lawyers/:lawyerId
 * Get detailed ranking information for a specific lawyer
 */
router.get('/lawyers/:lawyerId', getLawyerRankingDetails);

export default router;