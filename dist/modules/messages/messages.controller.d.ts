import { Model } from 'mongoose';
import { BusinessMessage } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';
export declare class MessagesController {
    private msgModel;
    private userModel;
    constructor(msgModel: Model<BusinessMessage>, userModel: Model<User>);
    getMessages(type?: 'all' | 'deleted' | 'edited', search?: string, ownerId?: string, page?: any, limit?: any): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMedia(category?: 'all' | 'photos' | 'voices' | 'videos' | 'stickers' | 'documents', ownerId?: string, status?: 'all' | 'deleted' | 'edited', search?: string, page?: any, limit?: any): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getConnections(): Promise<{
        id: string;
        owner: string;
        status: string;
        health: string;
        lastSync: Date;
        messagesLogged: number;
    }[]>;
}
