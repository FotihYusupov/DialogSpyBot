import { AnalyticsService } from '../analytics/analytics.service';
export declare class AdminController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
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
}
