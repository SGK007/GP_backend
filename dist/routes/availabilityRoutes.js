"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availability_controller_1 = require("../controllers/availability.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, availability_controller_1.addAvailability);
router.delete('/', auth_middleware_1.authMiddleware, availability_controller_1.removeAvailability);
router.get('/', auth_middleware_1.authMiddleware, availability_controller_1.getAvailability);
router.post('/full-day-unavailable', auth_middleware_1.authMiddleware, availability_controller_1.markFullDayUnavailable);
exports.default = router;
//# sourceMappingURL=availabilityRoutes.js.map