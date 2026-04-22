"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, booking_controller_1.createBooking);
router.post('/accept', auth_middleware_1.authMiddleware, booking_controller_1.acceptBooking);
router.post('/reject', auth_middleware_1.authMiddleware, booking_controller_1.rejectBooking);
router.post('/cancel', auth_middleware_1.authMiddleware, booking_controller_1.cancelBooking);
router.get('/', auth_middleware_1.authMiddleware, booking_controller_1.getUserBookings);
router.get('/lawyer', auth_middleware_1.authMiddleware, booking_controller_1.getLawyerBookings);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map