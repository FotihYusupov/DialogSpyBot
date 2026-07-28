import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(): Promise<{
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
