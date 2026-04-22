import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import lawyerRoutes from './routes/lawyerRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from './routes/chatRoutes';
import rankingRoutes from './routes/rankingRoutes';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount all API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ranking', rankingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
app.listen(port, () => {
  console.log(
    `🚀 Server is running on http://localhost:${port}`
  );
  console.log(`\n📚 API Endpoints:`);
  console.log(`   Authentication:`);
  console.log(`     POST   /api/auth/signup`);
  console.log(`     POST   /api/auth/login`);
  console.log(`     GET    /api/auth/profile`);
  console.log(`     PUT    /api/auth/profile`);
  console.log(`\n   Lawyers:`);
  console.log(`     GET    /api/lawyers`);
  console.log(`     GET    /api/lawyers/:id`);
  console.log(`\n   Availability:`);
  console.log(`     POST   /api/availability`);
  console.log(`     DELETE /api/availability`);
  console.log(`     GET    /api/availability`);
  console.log(`     POST   /api/availability/full-day-unavailable`);
  console.log(`\n   Bookings:`);
  console.log(`     POST   /api/bookings`);
  console.log(`     POST   /api/bookings/accept`);
  console.log(`     POST   /api/bookings/reject`);
  console.log(`     POST   /api/bookings/cancel`);
  console.log(`     GET    /api/bookings`);
  console.log(`     GET    /api/bookings/lawyer`);
  console.log(`\n   Chat:`);
  console.log(`     POST   /api/chats`);
  console.log(`     POST   /api/chats/message`);
  console.log(`     GET    /api/chats`);
  console.log(`     GET    /api/chats/:chatId`);
  console.log(`     PUT    /api/chats/:chatId`);
  console.log(`     DELETE /api/chats/:chatId`);
  console.log(`\n   Ranking:`);
  console.log(`     GET    /api/ranking/lawyers`);
  console.log(`     GET    /api/ranking/lawyers/:lawyerId\n`);
});