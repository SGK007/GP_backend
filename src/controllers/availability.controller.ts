import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

interface AddAvailabilityPayload {
  date: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  isFullDay?: boolean;
}

interface RemoveAvailabilityPayload {
  availabilityId: string;
}

// Add availability slot
export async function addAvailability(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload: AddAvailabilityPayload = req.body;

    // Validate required fields
    if (!payload.date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    if (!payload.isFullDay && (!payload.startTime || !payload.endTime)) {
      res.status(400).json({ error: 'Start time and end time are required for time slots' });
      return;
    }

    // Check if user is a lawyer
    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: req.user.id },
    });

    if (!lawyer) {
      res.status(403).json({ error: 'Only lawyers can manage availability' });
      return;
    }

    const dateObj = new Date(payload.date);

    const availability = await prisma.availability.create({
      data: {
        lawyerId: lawyer.id,
        date: dateObj,
        startTime: payload.isFullDay ? '00:00' : payload.startTime!,
        endTime: payload.isFullDay ? '23:59' : payload.endTime!,
        isFullDay: payload.isFullDay || false,
      },
    });

    res.status(201).json(availability);
  } catch (error) {
    next(error);
  }
}

// Remove availability slot
export async function removeAvailability(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { availabilityId } = req.body;

    if (!availabilityId) {
      res.status(400).json({ error: 'Availability ID is required' });
      return;
    }

    // Check if user is a lawyer and owns this availability slot
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: { lawyer: true },
    });

    if (!availability) {
      res.status(404).json({ error: 'Availability slot not found' });
      return;
    }

    if (availability.lawyer.userId !== req.user.id) {
      res.status(403).json({ error: 'You can only delete your own availability slots' });
      return;
    }

    await prisma.availability.delete({
      where: { id: availabilityId },
    });

    res.json({ message: 'Availability slot removed' });
  } catch (error) {
    next(error);
  }
}

// Get lawyer's availability slots
export async function getAvailability(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: req.user.id },
    });

    if (!lawyer) {
      res.status(403).json({ error: 'Only lawyers can view availability' });
      return;
    }

    const { startDate, endDate } = req.query;

    const where: any = { lawyerId: lawyer.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const availabilitySlots = await prisma.availability.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    res.json(availabilitySlots);
  } catch (error) {
    next(error);
  }
}

// Mark full day unavailable
export async function markFullDayUnavailable(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date } = req.body;

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: req.user.id },
    });

    if (!lawyer) {
      res.status(403).json({ error: 'Only lawyers can manage availability' });
      return;
    }

    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Remove all availability slots for that day
    await prisma.availability.deleteMany({
      where: {
        lawyerId: lawyer.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    res.json({ message: 'Full day marked as unavailable' });
  } catch (error) {
    next(error);
  }
}