"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ranking_controller_1 = require("../controllers/ranking.controller");
const router = express_1.default.Router();
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
router.get('/lawyers', ranking_controller_1.rankLawyers);
/**
 * GET /api/ranking/lawyers/:lawyerId
 * Get detailed ranking information for a specific lawyer
 */
router.get('/lawyers/:lawyerId', ranking_controller_1.getLawyerRankingDetails);
exports.default = router;
//# sourceMappingURL=rankingRoutes.js.map