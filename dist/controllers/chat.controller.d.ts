import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getUserChats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deleteChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateChatTitle(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map