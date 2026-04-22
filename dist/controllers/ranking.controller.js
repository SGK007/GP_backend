"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankLawyers = rankLawyers;
exports.getLawyerRankingDetails = getLawyerRankingDetails;
const prisma_1 = __importDefault(require("../lib/prisma"));
const aiService_1 = require("../services/aiService");
/**
 * Calculate overall ranking score based on multiple factors
 * Weights: bookings (30%), acceptance rate (30%), rating (40%)
 */
function calculateRankingScore(bookingCount, acceptanceRate, rating, maxBookings) {
    const normalizedBookings = maxBookings > 0 ? (bookingCount / maxBookings) * 100 : 0;
    const normalizedAcceptanceRate = acceptanceRate; // Already in percentage
    const normalizedRating = (rating / 5) * 100; // Assuming rating is 0-5
    const score = normalizedBookings * 0.3 +
        normalizedAcceptanceRate * 0.3 +
        normalizedRating * 0.4;
    return Math.round(score * 10) / 10; // Round to 1 decimal place
}
/**
 * Get acceptance rate for a lawyer
 */
async function getAcceptanceRate(lawyerId) {
    const bookings = await prisma_1.default.booking.findMany({
        where: { lawyerId },
        select: { status: true },
    });
    if (bookings.length === 0)
        return 0;
    const acceptedCount = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'COMPLETED').length;
    return (acceptedCount / bookings.length) * 100;
}
/**
 * Rank lawyers for a user based on bookings, acceptance rate, and ratings
 * Can optionally include AI suggestions for ranking
 */
async function rankLawyers(req, res, next) {
    try {
        const { userId, city, specialization, limit = 20, includeAISuggestions = false, } = req.query;
        // Build where clause for filtering
        const where = {
            user: {
                role: 'LAWYER',
            },
        };
        if (city) {
            where.city = {
                contains: city,
                mode: 'insensitive',
            };
        }
        if (specialization) {
            where.specialization = {
                contains: specialization,
                mode: 'insensitive',
            };
        }
        // Get all filtered lawyers
        const lawyers = await prisma_1.default.lawyer.findMany({
            where,
            select: {
                id: true,
                city: true,
                specialization: true,
                rating: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
                bookings: {
                    select: { id: true },
                },
            },
        });
        if (lawyers.length === 0) {
            res.json({
                data: [],
                total: 0,
                aiSuggestion: null,
            });
            return;
        }
        // Calculate acceptance rates and total bookings
        const maxBookings = Math.max(...(await Promise.all(lawyers.map(async (l) => {
            const count = await prisma_1.default.booking.count({
                where: { lawyerId: l.id },
            });
            return count;
        }))));
        // Build ranking scores
        const rankings = await Promise.all(lawyers.map(async (lawyer) => {
            const totalBookings = await prisma_1.default.booking.count({
                where: { lawyerId: lawyer.id },
            });
            const acceptanceRate = await getAcceptanceRate(lawyer.id);
            const overallScore = calculateRankingScore(totalBookings, acceptanceRate, lawyer.rating, maxBookings);
            return {
                lawyerId: lawyer.id,
                lawyerName: lawyer.user.name,
                specialization: lawyer.specialization,
                city: lawyer.city,
                profilePicture: lawyer.user.profilePicture,
                bookingCount: totalBookings,
                acceptanceRate: Math.round(acceptanceRate * 10) / 10,
                rating: lawyer.rating,
                overallScore,
            };
        }));
        // Sort by overall score (descending)
        rankings.sort((a, b) => b.overallScore - a.overallScore);
        // Apply limit
        const limitedRankings = rankings.slice(0, Math.min(limit, rankings.length));
        // Get AI suggestion if requested
        let aiSuggestion;
        if (includeAISuggestions && userId) {
            const systemPrompt = {
                role: 'system',
                content: `You are a helpful legal assistant. Based on the ranked list of lawyers, provide a brief suggestion (2-3 sentences) about which lawyer might be best suited. Consider their specialization, acceptance rate, bookings, and ratings.`,
            };
            const rankingsText = limitedRankings
                .slice(0, 5)
                .map((l, i) => `${i + 1}. ${l.lawyerName} (${l.specialization}) - Score: ${l.overallScore}, Acceptance Rate: ${l.acceptanceRate}%, Rating: ${l.rating}/5`)
                .join('\n');
            const userMessage = {
                role: 'user',
                content: `Here are the top 5 ranked lawyers:\n${rankingsText}\n\nPlease suggest which one might be best for legal consultation.`,
            };
            try {
                aiSuggestion = await (0, aiService_1.callAIAPI)([systemPrompt, userMessage]);
                // Track AI suggestion in database (optional - requires adding AILog model)
                // This could be stored for statistics/analytics
            }
            catch (error) {
                console.error('Failed to get AI suggestion:', error);
                // Continue without AI suggestion
            }
        }
        res.json({
            data: limitedRankings,
            total: rankings.length,
            returned: limitedRankings.length,
            aiSuggestion,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get ranking details for a specific lawyer
 */
async function getLawyerRankingDetails(req, res, next) {
    try {
        const { lawyerId } = req.params;
        const lawyer = await prisma_1.default.lawyer.findUnique({
            where: { id: lawyerId },
            select: {
                id: true,
                city: true,
                specialization: true,
                rating: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        });
        if (!lawyer) {
            res.status(404).json({ error: 'Lawyer not found' });
            return;
        }
        const totalBookings = await prisma_1.default.booking.count({
            where: { lawyerId },
        });
        const acceptanceRate = await getAcceptanceRate(lawyerId);
        // Get booking statistics
        const bookingStats = await prisma_1.default.booking.groupBy({
            by: ['status'],
            where: { lawyerId },
            _count: true,
        });
        res.json({
            lawyerId: lawyer.id,
            lawyerName: lawyer.user.name,
            specialization: lawyer.specialization,
            city: lawyer.city,
            profilePicture: lawyer.user.profilePicture,
            rating: lawyer.rating,
            bookingCount: totalBookings,
            acceptanceRate: Math.round(acceptanceRate * 10) / 10,
            bookingStats: bookingStats.reduce((acc, stat) => {
                acc[stat.status] = stat._count;
                return acc;
            }, {}),
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=ranking.controller.js.map