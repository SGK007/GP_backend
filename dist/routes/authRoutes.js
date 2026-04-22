"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Validation
        if (!name || !email || !password || !role) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        if (!['USER', 'LAWYER'].includes(role)) {
            res.status(400).json({ error: 'Invalid role. Must be USER or LAWYER' });
            return;
        }
        const result = await (0, authService_1.signup)({ name, email, password, role });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Email already exists') {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const result = await (0, authService_1.login)({ email, password });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
router.get('/profile', auth_middleware_1.authMiddleware, user_controller_1.getProfile);
router.put('/profile', auth_middleware_1.authMiddleware, user_controller_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map