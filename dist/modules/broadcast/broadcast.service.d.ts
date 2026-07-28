import { Model } from 'mongoose';
import { Broadcast } from './schemas/broadcast.schema';
import { UsersService } from '../users/users.service';
import { BotService } from '../bot/bot.service';
import { LogsService } from '../logs/logs.service';
export declare class BroadcastService {
    private broadcastModel;
    private usersService;
    private botService;
    private logsService;
    private readonly logger;
    constructor(broadcastModel: Model<Broadcast>, usersService: UsersService, botService: BotService, logsService: LogsService);
    create(data: Partial<Broadcast>): Promise<Broadcast>;
    findOne(id: string): Promise<Broadcast | null>;
    getAll(): Promise<Broadcast[]>;
    sendBroadcast(broadcastId: string): Promise<void>;
    private runBroadcastProcess;
}
