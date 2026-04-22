"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChat = createChat;
exports.sendMessage = sendMessage;
exports.getChatHistory = getChatHistory;
exports.getUserChats = getUserChats;
exports.deleteChat = deleteChat;
exports.updateChatTitle = updateChatTitle;
const prisma_1 = __importDefault(require("../lib/prisma"));
const aiService_1 = require("../services/aiService");
// Create new chat
async function createChat(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const payload = req.body;
        const chat = await prisma_1.default.chat.create({
            data: {
                userId: req.user.id,
                title: payload.title || 'New Chat',
            },
        });
        res.status(201).json(chat);
    }
    catch (error) {
        next(error);
    }
}
// Send message to AI
async function sendMessage(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const payload = req.body;
        if (!payload.message || payload.message.trim() === '') {
            res.status(400).json({ error: 'Message cannot be empty' });
            return;
        }
        let chatId = payload.chatId;
        // Create new chat if chatId not provided
        if (!chatId) {
            const newChat = await prisma_1.default.chat.create({
                data: {
                    userId: req.user.id,
                    title: payload.message.substring(0, 50),
                },
            });
            chatId = newChat.id;
        }
        else {
            // Verify chat ownership
            const chat = await prisma_1.default.chat.findUnique({
                where: { id: chatId },
            });
            if (!chat || chat.userId !== req.user.id) {
                res.status(403).json({ error: 'You do not have access to this chat' });
                return;
            }
        }
        // Save user message
        await prisma_1.default.chatMessage.create({
            data: {
                chatId,
                role: 'user',
                content: payload.message,
            },
        });
        try {
            // Get previous messages for context
            const previousMessages = await prisma_1.default.chatMessage.findMany({
                where: { chatId },
                take: 20,
                orderBy: { createdAt: 'asc' },
            });
            const conversationHistory = previousMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            // Get AI response
            const aiResponse = await (0, aiService_1.getLegalChatResponse)(payload.message, conversationHistory);
            // Save AI response
            const savedAIMessage = await prisma_1.default.chatMessage.create({
                data: {
                    chatId,
                    role: 'assistant',
                    content: aiResponse,
                },
            });
            // Get updated chat with all messages
            const updatedChat = await prisma_1.default.chat.findUnique({
                where: { id: chatId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
            res.json({
                chat: updatedChat,
                lastMessage: savedAIMessage,
            });
        }
        catch (aiError) {
            // Return error but keep the user message saved
            res.status(500).json({
                error: 'Failed to get AI response',
                chatId,
                userMessage: payload.message,
            });
        }
    }
    catch (error) {
        next(error);
    }
}
// Get chat history
async function getChatHistory(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { chatId } = req.params;
        const chat = await prisma_1.default.chat.findUnique({
            where: { id: chatId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }
        if (chat.userId !== req.user.id) {
            res.status(403).json({ error: 'You do not have access to this chat' });
            return;
        }
        res.json(chat);
    }
    catch (error) {
        next(error);
    }
}
// Get all user chats
async function getUserChats(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const chats = await prisma_1.default.chat.findMany({
            where: { userId: req.user.id },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(chats);
    }
    catch (error) {
        next(error);
    }
}
// Delete chat
async function deleteChat(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { chatId } = req.params;
        const chat = await prisma_1.default.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }
        if (chat.userId !== req.user.id) {
            res.status(403).json({ error: 'You do not have access to this chat' });
            return;
        }
        await prisma_1.default.chat.delete({
            where: { id: chatId },
        });
        res.json({ message: 'Chat deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
// Update chat title
async function updateChatTitle(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { chatId } = req.params;
        const { title } = req.body;
        if (!title || title.trim() === '') {
            res.status(400).json({ error: 'Title cannot be empty' });
            return;
        }
        const chat = await prisma_1.default.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }
        if (chat.userId !== req.user.id) {
            res.status(403).json({ error: 'You do not have access to this chat' });
            return;
        }
        const updatedChat = await prisma_1.default.chat.update({
            where: { id: chatId },
            data: { title },
        });
        res.json(updatedChat);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=chat.controller.js.map