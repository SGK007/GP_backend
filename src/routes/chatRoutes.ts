import { Router } from 'express';
import {
  createChat,
  sendMessage,
  getChatHistory,
  getUserChats,
  deleteChat,
  updateChatTitle,
} from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createChat);
router.post('/message', authMiddleware, sendMessage);
router.get('/', authMiddleware, getUserChats);
router.get('/:chatId', authMiddleware, getChatHistory);
router.put('/:chatId', authMiddleware, updateChatTitle);
router.delete('/:chatId', authMiddleware, deleteChat);

export default router;