import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { LogsService } from '../logs/logs.service';
import { PremiumService } from '../premium/premium.service';
import { SmartMemoryService } from '../memory/smart-memory.service';
export declare class BotService implements OnApplicationBootstrap, OnApplicationShutdown {
    private configService;
    private usersService;
    private messagesService;
    private logsService;
    private premiumService;
    private smartMemoryService;
    private bot;
    private readonly logger;
    private imagePath;
    constructor(configService: ConfigService, usersService: UsersService, messagesService: MessagesService, logsService: LogsService, premiumService: PremiumService, smartMemoryService: SmartMemoryService);
    getBotInstance(): Bot;
    downloadFile(filePath?: string, fileId?: string): Promise<Response>;
    onApplicationBootstrap(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    private escapeHTML;
    private extractMedia;
    private buildMainMenuKeyboard;
    private executePremiumFeature;
    private registerHandlers;
}
