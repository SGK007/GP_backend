"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lawyer_controller_1 = require("../controllers/lawyer.controller");
const router = (0, express_1.Router)();
router.get('/', lawyer_controller_1.getAllLawyers);
router.get('/:id', lawyer_controller_1.getLawyerById);
exports.default = router;
//# sourceMappingURL=lawyerRoutes.js.map