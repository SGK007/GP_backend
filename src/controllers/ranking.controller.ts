import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { callAIAPI, AIMessage } from '../services/aiService';

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
 * Calculate overall ranking score based on multiple factors
 * Weights: bookings (30%), acceptance rate (30%), rating (40%)
 */
function calculateRankingScore(
  bookingCount: number,
  acceptanceRate: number,
  rating: number,
  maxBookings: number
): number {
  const normalizedBookings = maxBookings > 0 ? (bookingCount / maxBookings) * 100 : 0;
  const normalizedAcceptanceRate = acceptanceRate; // Already in percentage
  const normalizedRating = (rating / 5) * 100; // Assuming rating is 0-5

  const score =
    normalizedBookings * 0.3 +
    normalizedAcceptanceRate * 0.3 +
    normalizedRating * 0.4;

  return Math.round(score * 10) / 10; // Round to 1 decimal place
}

/**
 * Get acceptance rate for a lawyer
 */
async function getAcceptanceRate(lawyerId: string): Promise<number> {
  const bookings = await prisma.booking.findMany({
    where: { lawyerId },
    select: { status: true },
  });

  if (bookings.length === 0) return 0;

  const acceptedCount = bookings.filter(
    (b: { status: string }) => b.status === 'ACCEPTED' || b.status === 'COMPLETED'
  ).length;

  return (acceptedCount / bookings.length) * 100;
}

/**
 * Rank lawyers for a user based on bookings, acceptance rate, and ratings
 * Can optionally include AI suggestions for ranking
 */
export async function rankLawyers(
  req: Request<{}, {}, {}, RankingQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      userId,
      city,
      specialization,
      limit = 20,
      includeAISuggestions = false,
    } = req.query;

    // Build where clause for filtering
    const where: any = {
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
    const lawyers = await prisma.lawyer.findMany({
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
    const maxBookings = Math.max(...(await Promise.all(
      lawyers.map(async (l: typeof lawyers[number]) => {
        const count = await prisma.booking.count({
          where: { lawyerId: l.id },
        });
        return count;
      })
    )));

    // Build ranking scores
    const rankings: LawyerRankingScore[] = await Promise.all(
      lawyers.map(async (lawyer: typeof lawyers[number]) => {
        const totalBookings = await prisma.booking.count({
          where: { lawyerId: lawyer.id },
        });

        const acceptanceRate = await getAcceptanceRate(lawyer.id);

        const overallScore = calculateRankingScore(
          totalBookings,
          acceptanceRate,
          lawyer.rating,
          maxBookings
        );

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
      })
    );

    // Sort by overall score (descending)
    rankings.sort((a, b) => b.overallScore - a.overallScore);

    // Apply limit
    const limitedRankings = rankings.slice(0, Math.min(limit as number, rankings.length));

    // Get AI suggestion if requested
    let aiSuggestion: string | undefined;
    if (includeAISuggestions && userId) {
      const systemPrompt: AIMessage = {
        role: 'system',
        content: `You are a helpful legal assistant. Based on the ranked list of lawyers, provide a brief suggestion (2-3 sentences) about which lawyer might be best suited. Consider their specialization, acceptance rate, bookings, and ratings.`,
      };

      const rankingsText = limitedRankings
        .slice(0, 5)
        .map(
          (l, i) =>
            `${i + 1}. ${l.lawyerName} (${l.specialization}) - Score: ${l.overallScore}, Acceptance Rate: ${l.acceptanceRate}%, Rating: ${l.rating}/5`
        )
        .join('\n');

      const userMessage: AIMessage = {
        role: 'user',
        content: `Here are the top 5 ranked lawyers:\n${rankingsText}\n\nPlease suggest which one might be best for legal consultation.`,
      };

      try {
        aiSuggestion = await callAIAPI([systemPrompt, userMessage]);

        // Track AI suggestion in database (optional - requires adding AILog model)
        // This could be stored for statistics/analytics
      } catch (error) {
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
  } catch (error) {
    next(error);
  }
}

/**
 * Get ranking details for a specific lawyer
 */
export async function getLawyerRankingDetails(
  req: Request<{ lawyerId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lawyerId } = req.params;

    const lawyer = await prisma.lawyer.findUnique({
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

    const totalBookings = await prisma.booking.count({
      where: { lawyerId },
    });

    const acceptanceRate = await getAcceptanceRate(lawyerId);

    // Get booking statistics
    const bookingStats = await prisma.booking.groupBy({
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
      bookingStats: bookingStats.reduce(
        (acc: Record<string, number>, stat: { status: string; _count: number }) => {
          acc[stat.status] = stat._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    next(error);
  }
}