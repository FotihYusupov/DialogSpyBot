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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findByChatId(chatId) {
        return this.userModel.findOne({ chat_id: chatId }).exec();
    }
    async findByConnectionId(connectionId) {
        return this.userModel.findOne({
            $or: [
                { business_connection_id: connectionId },
                { business_connection_ids: connectionId }
            ]
        }).exec();
    }
    async createOrUpdate(chatId, update) {
        return this.userModel.findOneAndUpdate({ chat_id: chatId }, { ...update, lastActiveAt: new Date() }, { upsert: true, returnDocument: 'after' }).exec();
    }
    async disconnectBusiness(connectionId) {
        return this.userModel.findOneAndUpdate({ business_connection_id: connectionId }, { $unset: { business_connection_id: '' } }, { returnDocument: 'after' }).exec();
    }
    async toggleNotification(chatId, type) {
        const user = await this.findByChatId(chatId);
        if (!user)
            return null;
        if (type === 'deletes') {
            user.notify_deletes = user.notify_deletes === false ? true : false;
        }
        else {
            user.notify_edits = user.notify_edits === false ? true : false;
        }
        return user.save();
    }
    async countTotal() {
        return this.userModel.countDocuments().exec();
    }
    async countConnected() {
        return this.userModel.countDocuments({ business_connection_id: { $exists: true, $ne: null } }).exec();
    }
    async countActiveSince(date) {
        return this.userModel.countDocuments({ lastActiveAt: { $gte: date } }).exec();
    }
    async getPaginated(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { username: { $regex: query.search, $options: 'i' } },
                { first_name: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.username) {
            filter.username = { $regex: query.username, $options: 'i' };
        }
        if (query.connected !== undefined) {
            if (query.connected) {
                filter.business_connection_id = { $exists: true, $ne: null };
            }
            else {
                filter.business_connection_id = { $exists: false };
            }
        }
        const [items, total] = await Promise.all([
            this.userModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);
        return { items, total, page, limit };
    }
    async getAllForExport(query) {
        const filter = {};
        if (query.connected !== undefined) {
            if (query.connected) {
                filter.business_connection_id = { $exists: true, $ne: null };
            }
            else {
                filter.business_connection_id = { $exists: false };
            }
        }
        return this.userModel.find(filter).sort({ createdAt: -1 }).exec();
    }
    async getGrowthStats(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return this.userModel.aggregate([
            { $match: { createdAt: { $gte: date } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();
    }
    async getConnectionsOverTime(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return this.userModel.aggregate([
            {
                $match: {
                    business_connection_id: { $exists: true, $ne: null },
                    updatedAt: { $gte: date }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();
    }
    async findAllUsers() {
        return this.userModel.find().exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map