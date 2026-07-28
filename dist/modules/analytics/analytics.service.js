"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const messages_service_1 = require("../messages/messages.service");
const logs_service_1 = require("../logs/logs.service");
let AnalyticsService = class AnalyticsService {
    constructor(usersService, messagesService, logsService) {
        this.usersService = usersService;
        this.messagesService = messagesService;
        this.logsService = logsService;
    }
    async getDashboardStats() {
        const totalUsers = await this.usersService.countTotal();
        const activeToday = await this.usersService.countActiveSince(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const activeWeekly = await this.usersService.countActiveSince(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const activeMonthly = await this.usersService.countActiveSince(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const connectedBusiness = await this.usersService.countConnected();
        const registrationsLast7Days = await this.usersService.countActiveSince(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const growth = totalUsers > 0 ? (registrationsLast7Days / totalUsers) * 100 : 0;
        const totalMessages = await this.messagesService.countAllMessages();
        const totalDeleted = await this.messagesService.countAllDeleted();
        const totalEdited = await this.messagesService.countAllEdited();
        const messagesToday = await this.messagesService.countMessagesToday();
        const averageActivity = await this.messagesService.getAverageActivityPerUser();
        const topActiveUsers = await this.messagesService.getTopActiveUsers(5);
        const growthStats = await this.usersService.getGrowthStats(7);
        const connStats = await this.usersService.getConnectionsOverTime(7);
        const growthChart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const g = growthStats.find(x => x._id === dateStr);
            const c = connStats.find(x => x._id === dateStr);
            const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            growthChart.push({
                date: formattedDate,
                users: g ? g.count : 0,
                connections: c ? c.count : 0
            });
        }
        const peakHours = await this.messagesService.getPeakHours(7);
        const hourlyActivity = [];
        for (let h = 0; h < 24; h += 4) {
            const hourStr = `${h.toString().padStart(2, '0')}:00`;
            const matches = peakHours.filter(p => p._id >= h && p._id < h + 4);
            const totalHoursCount = matches.reduce((sum, item) => sum + item.count, 0);
            hourlyActivity.push({
                hour: hourStr,
                messages: totalHoursCount
            });
        }
        const recentActivities = await this.logsService.getRecentActivities(15);
        return {
            totalUsers,
            activeUsers: activeToday,
            connectedBusinessAccounts: connectedBusiness,
            dailyUsers: activeToday,
            weeklyUsers: activeWeekly,
            monthlyUsers: activeMonthly,
            userGrowth: Number(growth.toFixed(2)),
            totalDeletedMessages: totalDeleted,
            totalEditedMessages: totalEdited,
            messagesToday,
            averageActivity: Number(averageActivity.toFixed(2)),
            topActiveUsers,
            growthChart,
            hourlyActivity,
            recentActivities,
        };
    }
    async getAnalyticsReport() {
        const day = 24 * 60 * 60 * 1000;
        const dau = await this.usersService.countActiveSince(new Date(Date.now() - day));
        const wau = await this.usersService.countActiveSince(new Date(Date.now() - 7 * day));
        const mau = await this.usersService.countActiveSince(new Date(Date.now() - 30 * day));
        const totalUsers = await this.usersService.countTotal();
        const connected = await this.usersService.countConnected();
        const connectionRate = totalUsers > 0 ? (connected / totalUsers) * 100 : 0;
        const retention = totalUsers > 0 ? (wau / totalUsers) * 100 : 0;
        const registrationsOverTime = await this.usersService.getGrowthStats(30);
        const connectionsOverTime = await this.usersService.getConnectionsOverTime(30);
        const peakHours = await this.messagesService.getPeakHours(30);
        const topActiveUsers = await this.messagesService.getTopActiveUsers(10);
        return {
            dau,
            wau,
            mau,
            retention: Number(retention.toFixed(2)),
            connectionRate: Number(connectionRate.toFixed(2)),
            registrationsOverTime,
            connectionsOverTime,
            peakHours,
            mostActiveUsers: topActiveUsers,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        messages_service_1.MessagesService,
        logs_service_1.LogsService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map