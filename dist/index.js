"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const lawyerRoutes_1 = __importDefault(require("./routes/lawyerRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const rankingRoutes_1 = __importDefault(require("./routes/rankingRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Mount all API routes under /api
app.use('/api/auth', authRoutes_1.default);
app.use('/api/lawyers', lawyerRoutes_1.default);
app.use('/api/availability', availabilityRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/ranking', rankingRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
});
// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
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
//# sourceMappingURL=index.js.map