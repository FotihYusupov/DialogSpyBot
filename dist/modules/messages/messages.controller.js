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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const user_schema_1 = require("../users/schemas/user.schema");
let MessagesController = class MessagesController {
    constructor(msgModel, userModel) {
        this.msgModel = msgModel;
        this.userModel = userModel;
    }
    async getMessages(type, search, ownerId, page = 1, limit = 20) {
        const filter = {};
        if (type === 'deleted') {
            filter.is_deleted = true;
        }
        else if (type === 'edited') {
            filter.is_edited = true;
        }
        if (ownerId && ownerId !== 'all') {
            filter.owner_id = Number(ownerId);
        }
        if (search) {
            filter.$or = [
                { text: { $regex: search, $options: 'i' } },
                { sender_username: { $regex: search, $options: 'i' } },
                { sender_first_name: { $regex: search, $options: 'i' } }
            ];
        }
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(100, parsedLimit);
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            this.msgModel.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner_id',
                        foreignField: 'chat_id',
                        as: 'owner'
                    }
                },
                {
                    $addFields: {
                        owner: { $arrayElemAt: ['$owner', 0] }
                    }
                }
            ]).exec(),
            this.msgModel.countDocuments(filter).exec()
        ]);
        return { items, total, page: pageNum, limit: limitNum };
    }
    async getMedia(category, ownerId, status, search, page = 1, limit = 20) {
        const filter = {
            $or: [
                { media_type: { $exists: true, $ne: null } },
                { media_file_id: { $exists: true, $ne: null } }
            ]
        };
        if (category && category !== 'all') {
            if (category === 'photos') {
                filter.media_type = { $regex: 'rasm|photo|image', $options: 'i' };
            }
            else if (category === 'voices') {
                filter.media_type = { $regex: 'voice|ovoz|audio', $options: 'i' };
            }
            else if (category === 'videos') {
                filter.media_type = { $regex: 'video|gif|animation|round', $options: 'i' };
            }
            else if (category === 'stickers') {
                filter.media_type = { $regex: 'sticker', $options: 'i' };
            }
            else if (category === 'documents') {
                filter.media_type = { $regex: 'document|fayl|file', $options: 'i' };
            }
        }
        if (status === 'deleted') {
            filter.is_deleted = true;
        }
        else if (status === 'edited') {
            filter.is_edited = true;
        }
        if (ownerId && ownerId !== 'all') {
            filter.owner_id = Number(ownerId);
        }
        if (search) {
            filter.text = { $regex: search, $options: 'i' };
        }
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 24 : Math.min(100, parsedLimit);
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            this.msgModel.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner_id',
                        foreignField: 'chat_id',
                        as: 'owner'
                    }
                },
                {
                    $addFields: {
                        owner: { $arrayElemAt: ['$owner', 0] }
                    }
                }
            ]).exec(),
            this.msgModel.countDocuments(filter).exec()
        ]);
        return { items, total, page: pageNum, limit: limitNum };
    }
    async getConnections() {
        const usersWithConn = await this.userModel.find({
            business_connection_id: { $exists: true, $ne: null }
        }).exec();
        const connections = await Promise.all(usersWithConn.map(async (usr) => {
            const count = await this.msgModel.countDocuments({
                business_connection_id: usr.business_connection_id
            }).exec();
            return {
                id: usr.business_connection_id,
                owner: `${usr.first_name || 'User'} (@${usr.username || 'no_username'})`,
                status: 'active',
                health: 'healthy',
                lastSync: usr.updatedAt || usr.createdAt,
                messagesLogged: count
            };
        }));
        return connections;
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('ownerId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('media'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('ownerId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Get)('connections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConnections", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.BusinessMessage.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map