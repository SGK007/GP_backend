import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { getLegalChatResponse, AIMessage } from '../services/aiService';

interface SendMessagePayload {
  chatId?: string;
  message: string;
}

interface CreateChatPayload {
  title?: string;
}

// Create new chat
export async function createChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload: CreateChatPayload = req.body;

    const chat = await prisma.chat.create({
      data: {
        userId: req.user.id,
        title: payload.title || 'New Chat',
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
}

// Send message to AI
export async function sendMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload: SendMessagePayload = req.body;

    if (!payload.message || payload.message.trim() === '') {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    let chatId = payload.chatId;

    // Create new chat if chatId not provided
    if (!chatId) {
      const newChat = await prisma.chat.create({
        data: {
          userId: req.user.id,
          title: payload.message.substring(0, 50),
        },
      });
      chatId = newChat.id;
    } else {
      // Verify chat ownership
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat || chat.userId !== req.user.id) {
        res.status(403).json({ error: 'You do not have access to this chat' });
        return;
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        chatId,
        role: 'user',
        content: payload.message,
      },
    });

    try {
      // Get previous messages for context
      const previousMessages = await prisma.chatMessage.findMany({
        where: { chatId },
        take: 20,
        orderBy: { createdAt: 'asc' },
      });

      const conversationHistory: AIMessage[] = previousMessages.map((msg: typeof previousMessages[0]) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Get AI response
      const aiResponse = await getLegalChatResponse(payload.message, conversationHistory);

      // Save AI response
      const savedAIMessage = await prisma.chatMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: aiResponse,
        },
      });

      // Get updated chat with all messages
      const updatedChat = await prisma.chat.findUnique({
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
    } catch (aiError) {
      // Return error but keep the user message saved
      res.status(500).json({
        error: 'Failed to get AI response',
        chatId,
        userMessage: payload.message,
      });
    }
  } catch (error) {
    next(error);
  }
}

// Get chat history
export async function getChatHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
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
  } catch (error) {
    next(error);
  }
}

// Get all user chats
export async function getUserChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chats = await prisma.chat.findMany({
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
  } catch (error) {
    next(error);
  }
}

// Delete chat
export async function deleteChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
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

    await prisma.chat.delete({
      where: { id: chatId },
    });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// Update chat title
export async function updateChatTitle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    const chat = await prisma.chat.findUnique({
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

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });

    res.json(updatedChat);
  } catch (error) {
    next(error);
  }
}