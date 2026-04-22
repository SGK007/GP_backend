"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLawyers = getAllLawyers;
exports.getLawyerById = getLawyerById;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function getAllLawyers(req, res, next) {
    try {
        const { city, specialization, sortBy = 'rating', sortOrder = 'desc', skip = 0, take = 10, } = req.query;
        // Build where clause for filtering
        const where = {
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
        const orderBy = {};
        if (sortBy === 'rating') {
            orderBy.rating = sortOrder;
        }
        else if (sortBy === 'availability') {
            orderBy.availability = sortOrder;
        }
        const lawyers = await prisma_1.default.lawyer.findMany({
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
        const total = await prisma_1.default.lawyer.count({ where });
        res.json({
            data: lawyers,
            total,
            count: lawyers.length,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getLawyerById(req, res, next) {
    try {
        const { id } = req.params;
        const lawyer = await prisma_1.default.lawyer.findUnique({
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=lawyer.controller.js.map