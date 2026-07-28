import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { LogsService } from '../logs/logs.service';
export declare class AnalyticsService {
    private usersService;
    private messagesService;
    private logsService;
    constructor(usersService: UsersService, messagesService: MessagesService, logsService: LogsService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        connectedBusinessAccounts: number;
        dailyUsers: number;
        weeklyUsers: number;
        monthlyUsers: number;
        userGrowth: number;
        totalDeletedMessages: number;
        totalEditedMessages: number;
        messagesToday: number;
        averageActivity: number;
        topActiveUsers: any[];
        growthChart: any[];
        hourlyActivity: any[];
        recentActivities: import("../logs/schemas/activity-log.schema").ActivityLog[];
    }>;
    getAnalyticsReport(): Promise<{
        dau: number;
        wau: number;
        mau: number;
        retention: number;
        connectionRate: number;
        registrationsOverTime: any[];
        connectionsOverTime: any[];
        peakHours: any[];
        mostActiveUsers: any[];
    }>;
}
