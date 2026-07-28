import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findByChatId(chatId: number): Promise<User | null>;
    findByConnectionId(connectionId: string): Promise<User | null>;
    createOrUpdate(chatId: number, update: Partial<User>): Promise<User>;
    disconnectBusiness(connectionId: string): Promise<User | null>;
    toggleNotification(chatId: number, type: 'deletes' | 'edits'): Promise<User | null>;
    countTotal(): Promise<number>;
    countConnected(): Promise<number>;
    countActiveSince(date: Date): Promise<number>;
    getPaginated(query: {
        page?: number;
        limit?: number;
        search?: string;
        username?: string;
        connected?: boolean;
    }): Promise<{
        items: (import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
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
    getAllForExport(query: any): Promise<User[]>;
    getGrowthStats(days: number): Promise<any[]>;
    getConnectionsOverTime(days: number): Promise<any[]>;
    findAllUsers(): Promise<User[]>;
}
