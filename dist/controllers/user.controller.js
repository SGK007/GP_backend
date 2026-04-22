"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Get user profile
async function getProfile(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        next(error);
    }
}
// Update user profile
async function updateProfile(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const payload = req.body;
        // Validate payload
        if (payload.name === '' || (payload.profilePicture === '')) {
            res.status(400).json({ error: 'Invalid input' });
            return;
        }
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=user.controller.js.map