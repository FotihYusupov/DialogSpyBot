import { Model } from 'mongoose';
import { SystemLog } from './schemas/log.schema';
import { ActivityLog } from './schemas/activity-log.schema';
export declare class LogsService {
    private logModel;
    private activityLogModel;
    constructor(logModel: Model<SystemLog>, activityLogModel: Model<ActivityLog>);
    logTelegramError(message: string, stack?: string, meta?: any): Promise<SystemLog>;
    logApiError(message: string, stack?: string, meta?: any): Promise<SystemLog>;
    logException(message: string, stack?: string, meta?: any): Promise<SystemLog>;
    logFailedBroadcast(message: string, meta?: any): Promise<SystemLog>;
    logActivity(action: 'bot_start' | 'business_connected' | 'business_disconnected', chat_id: number, userInfo: {
        username?: string;
        first_name?: string;
    }, meta?: any): Promise<ActivityLog>;
    getRecentActivities(limit?: number): Promise<ActivityLog[]>;
    getPaginated(query: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{
        items: (import("mongoose").Document<unknown, {}, SystemLog, {}, import("mongoose").DefaultSchemaOptions> & SystemLog & Required<{
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
    getActivityPaginated(query: {
        page?: number;
        limit?: number;
        action?: string;
        search?: string;
    }): Promise<{
        items: (import("mongoose").Document<unknown, {}, ActivityLog, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & Required<{
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
}
