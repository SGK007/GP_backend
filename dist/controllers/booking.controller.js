"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.acceptBooking = acceptBooking;
exports.rejectBooking = rejectBooking;
exports.getUserBookings = getUserBookings;
exports.getLawyerBookings = getLawyerBookings;
exports.cancelBooking = cancelBooking;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Create booking
async function createBooking(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const payload = req.body;
        if (!payload.availabilityId) {
            res.status(400).json({ error: 'Availability ID is required' });
            return;
        }
        // Check if user is not a lawyer
        const userRole = req.user.role;
        if (userRole === 'LAWYER') {
            res.status(403).json({ error: 'Lawyers cannot book other lawyers' });
            return;
        }
        // Check if availability exists
        const availability = await prisma_1.default.availability.findUnique({
            where: { id: payload.availabilityId },
            include: { lawyer: true },
        });
        if (!availability) {
            res.status(404).json({ error: 'Availability slot not found' });
            return;
        }
        // Check for double booking
        const existingBooking = await prisma_1.default.booking.findUnique({
            where: {
                availabilityId_userId: {
                    availabilityId: payload.availabilityId,
                    userId: req.user.id,
                },
            },
        });
        if (existingBooking) {
            res.status(409).json({ error: 'You already have a booking for this slot' });
            return;
        }
        // Check if slot is already booked by someone else
        const bookedSlot = await prisma_1.default.booking.findFirst({
            where: {
                availabilityId: payload.availabilityId,
                status: 'ACCEPTED',
            },
        });
        if (bookedSlot) {
            res.status(409).json({ error: 'This time slot is already booked' });
            return;
        }
        // Create booking
        const booking = await prisma_1.default.booking.create({
            data: {
                userId: req.user.id,
                lawyerId: availability.lawyerId,
                availabilityId: payload.availabilityId,
                reason: payload.reason,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                lawyer: {
                    select: { id: true, userId: true },
                },
                availability: true,
            },
        });
        res.status(201).json(booking);
    }
    catch (error) {
        next(error);
    }
}
// Accept booking (lawyer only)
async function acceptBooking(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { bookingId } = req.body;
        if (!bookingId) {
            res.status(400).json({ error: 'Booking ID is required' });
            return;
        }
        // Check if user is a lawyer
        const lawyer = await prisma_1.default.lawyer.findUnique({
            where: { userId: req.user.id },
        });
        if (!lawyer) {
            res.status(403).json({ error: 'Only lawyers can accept bookings' });
            return;
        }
        // Get booking
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
            include: { availability: true },
        });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        // Check if lawyer owns this booking
        if (booking.lawyerId !== lawyer.id) {
            res.status(403).json({ error: 'You can only accept your own bookings' });
            return;
        }
        // Check if booking is still pending
        if (booking.status !== 'PENDING') {
            res.status(409).json({ error: `Booking is already ${booking.status.toLowerCase()}` });
            return;
        }
        // Check for other accepted bookings on the same slot
        const otherAccepted = await prisma_1.default.booking.findFirst({
            where: {
                availabilityId: booking.availabilityId,
                status: 'ACCEPTED',
                NOT: { id: bookingId },
            },
        });
        if (otherAccepted) {
            res.status(409).json({ error: 'Another user has already booked this slot' });
            return;
        }
        // Accept booking
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: 'ACCEPTED' },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                lawyer: {
                    select: { id: true, userId: true },
                },
                availability: true,
            },
        });
        res.json(updatedBooking);
    }
    catch (error) {
        next(error);
    }
}
// Reject booking (lawyer only)
async function rejectBooking(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { bookingId, rejectionReason } = req.body;
        if (!bookingId) {
            res.status(400).json({ error: 'Booking ID is required' });
            return;
        }
        // Check if user is a lawyer
        const lawyer = await prisma_1.default.lawyer.findUnique({
            where: { userId: req.user.id },
        });
        if (!lawyer) {
            res.status(403).json({ error: 'Only lawyers can reject bookings' });
            return;
        }
        // Get booking
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        // Check if lawyer owns this booking
        if (booking.lawyerId !== lawyer.id) {
            res.status(403).json({ error: 'You can only reject your own bookings' });
            return;
        }
        // Check if booking is still pending
        if (booking.status !== 'PENDING') {
            res.status(409).json({ error: `Booking is already ${booking.status.toLowerCase()}` });
            return;
        }
        // Reject booking
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: 'REJECTED',
                rejectionReason: rejectionReason,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                lawyer: {
                    select: { id: true, userId: true },
                },
                availability: true,
            },
        });
        res.json(updatedBooking);
    }
    catch (error) {
        next(error);
    }
}
// Get user's bookings
async function getUserBookings(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { status } = req.query;
        const where = { userId: req.user.id };
        if (status) {
            where.status = status.toUpperCase();
        }
        const bookings = await prisma_1.default.booking.findMany({
            where,
            include: {
                lawyer: {
                    select: {
                        id: true,
                        city: true,
                        specialization: true,
                        rating: true,
                        user: {
                            select: { name: true, email: true, profilePicture: true },
                        },
                    },
                },
                availability: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        next(error);
    }
}
// Get lawyer's bookings
async function getLawyerBookings(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Check if user is a lawyer
        const lawyer = await prisma_1.default.lawyer.findUnique({
            where: { userId: req.user.id },
        });
        if (!lawyer) {
            res.status(403).json({ error: 'Only lawyers can view their bookings' });
            return;
        }
        const { status } = req.query;
        const where = { lawyerId: lawyer.id };
        if (status) {
            where.status = status.toUpperCase();
        }
        const bookings = await prisma_1.default.booking.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, profilePicture: true },
                },
                availability: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        next(error);
    }
}
// Cancel booking
async function cancelBooking(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { bookingId } = req.body;
        if (!bookingId) {
            res.status(400).json({ error: 'Booking ID is required' });
            return;
        }
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        // Check if user owns this booking
        if (booking.userId !== req.user.id) {
            res.status(403).json({ error: 'You can only cancel your own bookings' });
            return;
        }
        // Check if booking can be cancelled
        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
            res.status(409).json({ error: `Booking cannot be cancelled (status: ${booking.status})` });
            return;
        }
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' },
            include: {
                lawyer: {
                    select: {
                        id: true,
                        city: true,
                        specialization: true,
                        user: { select: { name: true } },
                    },
                },
                availability: true,
            },
        });
        res.json(updatedBooking);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=booking.controller.js.map