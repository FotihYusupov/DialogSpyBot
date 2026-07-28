import { LogsService } from './logs.service';
export declare class LogsController {
    private logsService;
    constructor(logsService: LogsService);
    getLogs(page?: number, limit?: number, type?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/log.schema").SystemLog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/log.schema").SystemLog & Required<{
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
    getActivityLogs(page?: number, limit?: number, action?: string, search?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/activity-log.schema").ActivityLog & Required<{
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
