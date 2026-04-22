import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

interface UpdateProfilePayload {
  name?: string;
  profilePicture?: string;
}

// Get user profile
export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

// Update user profile
export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload: UpdateProfilePayload = req.body;

    // Validate payload
    if (payload.name === '' || (payload.profilePicture === '')) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.profilePicture && { profilePicture: payload.profilePicture }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}