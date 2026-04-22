import { Router } from 'express';
import {
  createBooking,
  acceptBooking,
  rejectBooking,
  getUserBookings,
  getLawyerBookings,
  cancelBooking,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createBooking);
router.post('/accept', authMiddleware, acceptBooking);
router.post('/reject', authMiddleware, rejectBooking);
router.post('/cancel', authMiddleware, cancelBooking);
router.get('/', authMiddleware, getUserBookings);
router.get('/lawyer', authMiddleware, getLawyerBookings);

export default router;