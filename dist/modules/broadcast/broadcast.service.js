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
var BroadcastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const broadcast_schema_1 = require("./schemas/broadcast.schema");
const users_service_1 = require("../users/users.service");
const bot_service_1 = require("../bot/bot.service");
const grammy_1 = require("grammy");
const logs_service_1 = require("../logs/logs.service");
let BroadcastService = BroadcastService_1 = class BroadcastService {
    constructor(broadcastModel, usersService, botService, logsService) {
        this.broadcastModel = broadcastModel;
        this.usersService = usersService;
        this.botService = botService;
        this.logsService = logsService;
        this.logger = new common_1.Logger(BroadcastService_1.name);
    }
    async create(data) {
        return this.broadcastModel.create(data);
    }
    async findOne(id) {
        return this.broadcastModel.findById(id).exec();
    }
    async getAll() {
        return this.broadcastModel.find().sort({ createdAt: -1 }).exec();
    }
    async sendBroadcast(broadcastId) {
        const broadcast = await this.broadcastModel.findById(broadcastId);
        if (!broadcast || broadcast.status !== 'pending') {
            return;
        }
        broadcast.status = 'processing';
        await broadcast.save();
        this.runBroadcastProcess(broadcast).catch((err) => {
            this.logger.error(`Broadcast failed: ${err.message}`);
        });
    }
    async runBroadcastProcess(broadcast) {
        const users = await this.usersService.findAllUsers();
        let targets = users;
        const day = 24 * 60 * 60 * 1000;
        if (broadcast.targetFilter === 'connected') {
            targets = users.filter((u) => !!u.business_connection_id);
        }
        else if (broadcast.targetFilter === 'disconnected') {
            targets = users.filter((u) => !u.business_connection_id);
        }
        else if (broadcast.targetFilter === 'active') {
            const activeThreshold = new Date(Date.now() - 7 * day);
            targets = users.filter((u) => u.lastActiveAt >= activeThreshold);
        }
        const bot = this.botService.getBotInstance();
        let sent = 0;
        let failed = 0;
        let keyboard = undefined;
        if (broadcast.inlineButtons && broadcast.inlineButtons.length > 0) {
            keyboard = new grammy_1.InlineKeyboard();
            broadcast.inlineButtons.forEach((btn, idx) => {
                if (idx > 0 && idx % 2 === 0)
                    keyboard.row();
                keyboard.url(btn.text, btn.url);
            });
        }
        for (const user of targets) {
            try {
                if (broadcast.mediaType === 'image' && broadcast.mediaUrl) {
                    await bot.api.sendPhoto(user.chat_id, broadcast.mediaUrl, {
                        caption: broadcast.text,
                        reply_markup: keyboard,
                    });
                }
                else if (broadcast.mediaType === 'video' && broadcast.mediaUrl) {
                    await bot.api.sendVideo(user.chat_id, broadcast.mediaUrl, {
                        caption: broadcast.text,
                        reply_markup: keyboard,
                    });
                }
                else {
                    await bot.api.sendMessage(user.chat_id, broadcast.text, {
                        reply_markup: keyboard,
                        parse_mode: 'HTML',
                    });
                }
                sent++;
            }
            catch (err) {
                failed++;
                this.logger.error(`Failed to send broadcast to ${user.chat_id}: ${err.message}`);
                await this.logsService.logFailedBroadcast(`Failed delivery to ${user.chat_id}`, {
                    broadcastId: broadcast._id,
                    userId: user.chat_id,
                    error: err.message,
                });
            }
            await new Promise((resolve) => setTimeout(resolve, 40));
        }
        broadcast.sentCount = sent;
        broadcast.failedCount = failed;
        broadcast.status = 'completed';
        await broadcast.save();
        this.logger.log(`Broadcast completed. Sent: ${sent}, Failed: ${failed}`);
    }
};
exports.BroadcastService = BroadcastService;
exports.BroadcastService = BroadcastService = BroadcastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(broadcast_schema_1.Broadcast.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => bot_service_1.BotService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        bot_service_1.BotService,
        logs_service_1.LogsService])
], BroadcastService);
//# sourceMappingURL=broadcast.service.js.map