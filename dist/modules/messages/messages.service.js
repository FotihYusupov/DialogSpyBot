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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(msgModel) {
        this.msgModel = msgModel;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('Ensuring BusinessMessage indexes are synced in MongoDB...');
            await this.msgModel.createIndexes();
            this.logger.log('BusinessMessage indexes synced successfully.');
        }
        catch (err) {
            this.logger.error(`Error building BusinessMessage indexes: ${err.message}`);
        }
    }
    async create(data) {
        return this.msgModel.create(data);
    }
    async findOne(businessConnectionId, messageId) {
        return this.msgModel.findOne({
            business_connection_id: businessConnectionId,
            message_id: messageId,
        }).exec();
    }
    async markDeleted(businessConnectionId, messageId) {
        return this.msgModel.findOneAndUpdate({
            business_connection_id: businessConnectionId,
            message_id: messageId,
        }, { is_deleted: true }, { returnDocument: 'after' }).exec();
    }
    async search(businessConnectionId, query, limit = 10) {
        const cleanQuery = query.trim();
        if (!cleanQuery)
            return [];
        try {
            const textResults = await this.msgModel.find({
                business_connection_id: businessConnectionId,
                $text: { $search: cleanQuery }
            }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' }, date: -1 })
                .limit(limit)
                .exec();
            if (textResults && textResults.length > 0) {
                return textResults;
            }
        }
        catch (err) {
        }
        return this.msgModel.find({
            business_connection_id: businessConnectionId,
            $or: [
                { text: { $regex: cleanQuery, $options: 'i' } },
                { 'edit_history.text': { $regex: cleanQuery, $options: 'i' } },
            ],
        })
            .limit(limit)
            .exec();
    }
    async getDeletedAndEditedForExport(businessConnectionId) {
        return this.msgModel.find({
            business_connection_id: businessConnectionId,
            $or: [{ is_deleted: true }, { is_edited: true }],
        })
            .lean()
            .exec();
    }
    async countTotal(ownerId, connectionIds = [], primaryConnectionId) {
        const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
        if (Object.keys(filter).length === 0) {
            return this.msgModel.estimatedDocumentCount().exec();
        }
        return this.msgModel.countDocuments(filter).exec();
    }
    async countDeleted(ownerId, connectionIds = [], primaryConnectionId) {
        const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
        filter.is_deleted = true;
        return this.msgModel.countDocuments(filter).exec();
    }
    async countEdited(ownerId, connectionIds = [], primaryConnectionId) {
        const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
        filter.is_edited = true;
        return this.msgModel.countDocuments(filter).exec();
    }
    buildUserMessagesFilter(ownerId, connectionIds = [], primaryConnectionId) {
        const conditions = [];
        if (primaryConnectionId) {
            conditions.push({ business_connection_id: primaryConnectionId });
        }
        if (connectionIds && connectionIds.length > 0) {
            conditions.push({ business_connection_id: { $in: connectionIds } });
        }
        if (ownerId) {
            conditions.push({ owner_id: ownerId });
        }
        if (conditions.length === 0) {
            return {};
        }
        return { $or: conditions };
    }
    async countAllMessages() {
        return this.msgModel.estimatedDocumentCount().exec();
    }
    async countAllDeleted() {
        return this.msgModel.countDocuments({ is_deleted: true }).exec();
    }
    async countAllEdited() {
        return this.msgModel.countDocuments({ is_edited: true }).exec();
    }
    async countMessagesToday() {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return this.msgModel.countDocuments({ createdAt: { $gte: startOfToday } }).exec();
    }
    async getAverageActivityPerUser() {
        const result = await this.msgModel.aggregate([
            {
                $group: {
                    _id: '$owner_id',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: '$count' }
                }
            }
        ]).exec();
        return result[0]?.avg || 0;
    }
    async getTopActiveUsers(limit = 10) {
        return this.msgModel.aggregate([
            {
                $group: {
                    _id: '$owner_id',
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { messageCount: -1, _id: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'chat_id',
                    as: 'userInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    messageCount: 1,
                    username: { $arrayElemAt: ['$userInfo.username', 0] }
                }
            }
        ]).exec();
    }
    async getPeakHours(days = 7) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return this.msgModel.aggregate([
            { $match: { createdAt: { $gte: date } } },
            {
                $project: {
                    hour: { $hour: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: '$hour',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();
    }
    async getUserChats(ownerId) {
        const chats = await this.msgModel.aggregate([
            { $match: { owner_id: ownerId } },
            { $sort: { date: 1 } },
            {
                $group: {
                    _id: '$chat_id',
                    chat_title: { $last: '$chat_title' },
                    chat_type: { $last: '$chat_type' },
                    last_message: { $last: '$text' },
                    last_message_media: { $last: '$media_type' },
                    last_message_date: { $last: '$date' },
                    sender_names: {
                        $addToSet: {
                            sender_id: '$sender_id',
                            first_name: '$sender_first_name',
                            last_name: '$sender_last_name',
                            username: '$sender_username'
                        }
                    }
                }
            },
            { $sort: { last_message_date: -1 } }
        ]).exec();
        return chats.map(chat => {
            if (chat.chat_type === 'private' && (chat.chat_title === 'Shaxsiy chat' || !chat.chat_title)) {
                const otherParty = chat.sender_names?.find((s) => s.sender_id === chat._id);
                if (otherParty) {
                    const fullName = `${otherParty.first_name || ''} ${otherParty.last_name || ''}`.trim();
                    chat.chat_title = fullName || (otherParty.username ? `@${otherParty.username}` : `User ${chat._id}`);
                }
                else {
                    const fallbackParty = chat.sender_names?.find((s) => s.sender_id !== ownerId);
                    if (fallbackParty) {
                        const fullName = `${fallbackParty.first_name || ''} ${fallbackParty.last_name || ''}`.trim();
                        chat.chat_title = fullName || (fallbackParty.username ? `@${fallbackParty.username}` : `User ${chat._id}`);
                    }
                }
            }
            delete chat.sender_names;
            return chat;
        });
    }
    async getChatMessages(ownerId, chatId) {
        return this.msgModel.find({
            owner_id: ownerId,
            chat_id: chatId
        })
            .sort({ date: 1 })
            .exec();
    }
    async getChatMessagesTimeframe(ownerId, chatId, fromDate) {
        const filter = {
            owner_id: ownerId,
            chat_id: chatId,
        };
        if (fromDate) {
            filter.$or = [
                { date: { $gte: fromDate } },
                { createdAt: { $gte: fromDate } },
            ];
        }
        return this.msgModel.find(filter)
            .sort({ date: 1 })
            .exec();
    }
    async getChatMessagesPaginated(ownerId, chatId, page, limit) {
        const skip = (page - 1) * limit;
        return this.msgModel.find({
            owner_id: ownerId,
            chat_id: chatId
        })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async updateFilePathByFileId(fileId, filePath) {
        await this.msgModel.updateMany({ media_file_id: fileId }, { media_file_path: filePath }).exec();
    }
    async findByMongoId(mongoId) {
        try {
            return this.msgModel.findById(mongoId).exec();
        }
        catch {
            return null;
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.BusinessMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MessagesService);
//# sourceMappingURL=messages.service.js.map