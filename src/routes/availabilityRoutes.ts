import { Router } from 'express';
import {
  addAvailability,
  removeAvailability,
  getAvailability,
  markFullDayUnavailable,
} from '../controllers/availability.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, addAvailability);
router.delete('/', authMiddleware, removeAvailability);
router.get('/', authMiddleware, getAvailability);
router.post('/full-day-unavailable', authMiddleware, markFullDayUnavailable);

export default router;