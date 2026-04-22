import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

interface GetLawyersQuery {
  city?: string;
  specialization?: string;
  sortBy?: 'rating' | 'availability';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

export async function getAllLawyers(
  req: Request<{}, {}, {}, GetLawyersQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      city,
      specialization,
      sortBy = 'rating',
      sortOrder = 'desc',
      skip = 0,
      take = 10,
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

    // Build orderBy clause for sorting
    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'availability') {
      orderBy.availability = sortOrder;
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdAt: 'desc' },
      skip: parseInt(skip?.toString() || '0'),
      take: parseInt(take?.toString() || '10'),
      select: {
        id: true,
        city: true,
        specialization: true,
        rating: true,
        availability: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    const total = await prisma.lawyer.count({ where });

    res.json({
      data: lawyers,
      total,
      count: lawyers.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLawyerById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        specialization: true,
        rating: true,
        availability: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!lawyer) {
      res.status(404).json({ error: 'Lawyer not found' });
      return;
    }

    res.json(lawyer);
  } catch (error) {
    next(error);
  }
}