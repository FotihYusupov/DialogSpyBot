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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const log_schema_1 = require("./schemas/log.schema");
const activity_log_schema_1 = require("./schemas/activity-log.schema");
let LogsService = class LogsService {
    constructor(logModel, activityLogModel) {
        this.logModel = logModel;
        this.activityLogModel = activityLogModel;
    }
    async logTelegramError(message, stack, meta) {
        return this.logModel.create({ type: 'telegram_error', message, stack, meta });
    }
    async logApiError(message, stack, meta) {
        return this.logModel.create({ type: 'api_error', message, stack, meta });
    }
    async logException(message, stack, meta) {
        return this.logModel.create({ type: 'exception', message, stack, meta });
    }
    async logFailedBroadcast(message, meta) {
        return this.logModel.create({ type: 'failed_broadcast', message, meta });
    }
    async logActivity(action, chat_id, userInfo, meta) {
        return this.activityLogModel.create({
            action,
            chat_id,
            username: userInfo.username,
            first_name: userInfo.first_name,
            meta,
        });
    }
    async getRecentActivities(limit = 10) {
        return this.activityLogModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
    async getPaginated(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.type) {
            filter.type = query.type;
        }
        const [items, total] = await Promise.all([
            this.logModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).exec(),
            this.logModel.countDocuments(filter).exec(),
        ]);
        return { items, total, page, limit };
    }
    async getActivityPaginated(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.action && query.action !== 'all') {
            filter.action = query.action;
        }
        if (query.search) {
            const isNumber = !isNaN(Number(query.search));
            if (isNumber) {
                filter.$or = [
                    { chat_id: Number(query.search) },
                    { username: { $regex: query.search, $options: 'i' } },
                    { first_name: { $regex: query.search, $options: 'i' } },
                ];
            }
            else {
                filter.$or = [
                    { username: { $regex: query.search, $options: 'i' } },
                    { first_name: { $regex: query.search, $options: 'i' } },
                ];
            }
        }
        const [items, total] = await Promise.all([
            this.activityLogModel
                .find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.activityLogModel.countDocuments(filter).exec(),
        ]);
        return { items, total, page, limit };
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(log_schema_1.SystemLog.name)),
    __param(1, (0, mongoose_1.InjectModel)(activity_log_schema_1.ActivityLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], LogsService);
//# sourceMappingURL=logs.service.js.map