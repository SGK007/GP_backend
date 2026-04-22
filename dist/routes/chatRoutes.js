"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, chat_controller_1.createChat);
router.post('/message', auth_middleware_1.authMiddleware, chat_controller_1.sendMessage);
router.get('/', auth_middleware_1.authMiddleware, chat_controller_1.getUserChats);
router.get('/:chatId', auth_middleware_1.authMiddleware, chat_controller_1.getChatHistory);
router.put('/:chatId', auth_middleware_1.authMiddleware, chat_controller_1.updateChatTitle);
router.delete('/:chatId', auth_middleware_1.authMiddleware, chat_controller_1.deleteChat);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map