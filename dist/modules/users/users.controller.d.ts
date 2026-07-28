import { Response } from 'express';
import { UsersService } from './users.service';
import { BotService } from '../bot/bot.service';
import { MessagesService } from '../messages/messages.service';
import { PremiumService } from '../premium/premium.service';
export declare class UsersController {
    private usersService;
    private botService;
    private messagesService;
    private premiumService;
    constructor(usersService: UsersService, botService: BotService, messagesService: MessagesService, premiumService: PremiumService);
    getUsers(page?: number, limit?: number, search?: string, username?: string, connected?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    enablePremium(chatId: string, expiresAt?: string | null): Promise<{
        success: boolean;
        user: import("./schemas/user.schema").User;
        details: {
            isPremiumActive: boolean;
            isLifetime: boolean;
            expiresAt: string;
            remainingDays: number;
            formattedStatus: string;
        };
    }>;
    disablePremium(chatId: string): Promise<{
        success: boolean;
        user: import("./schemas/user.schema").User;
        details: {
            isPremiumActive: boolean;
            isLifetime: boolean;
            expiresAt: string;
            remainingDays: number;
            formattedStatus: string;
        };
    }>;
    togglePremium(chatId: string, body: {
        isPremium: boolean;
        expiresAt?: string | null;
    }): Promise<{
        success: boolean;
        user: any;
        details: {
            isPremiumActive: boolean;
            isLifetime: boolean;
            expiresAt: string;
            remainingDays: number;
            formattedStatus: string;
        };
    }>;
    exportCsv(connected: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getMedia(filePath: string, fileId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserChats(chatId: string): Promise<any[]>;
    getChatMessages(chatId: string, targetChatId: string, page?: string, limit?: string): Promise<import("../messages/schemas/message.schema").BusinessMessage[]>;
    simulateTest(chatId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
