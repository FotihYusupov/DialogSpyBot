"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const users_service_1 = require("./users.service");
const bot_service_1 = require("../bot/bot.service");
const messages_service_1 = require("../messages/messages.service");
const premium_service_1 = require("../premium/premium.service");
const fs = __importStar(require("fs"));
const chat_pdf_util_1 = require("../bot/utils/chat-pdf.util");
let UsersController = class UsersController {
    constructor(usersService, botService, messagesService, premiumService) {
        this.usersService = usersService;
        this.botService = botService;
        this.messagesService = messagesService;
        this.premiumService = premiumService;
    }
    async getUsers(page, limit, search, username, connected) {
        const isConnected = connected === 'true' ? true : (connected === 'false' ? false : undefined);
        return this.usersService.getPaginated({
            page,
            limit,
            search,
            username,
            connected: isConnected,
        });
    }
    async enablePremium(chatId, expiresAt) {
        const user = await this.premiumService.enablePremium(chatId, expiresAt);
        const details = this.premiumService.getPremiumStatusDetails(user);
        return { success: true, user, details };
    }
    async disablePremium(chatId) {
        const user = await this.premiumService.disablePremium(chatId);
        const details = this.premiumService.getPremiumStatusDetails(user);
        return { success: true, user, details };
    }
    async togglePremium(chatId, body) {
        let user;
        if (body.isPremium) {
            user = await this.premiumService.enablePremium(chatId, body.expiresAt);
        }
        else {
            user = await this.premiumService.disablePremium(chatId);
        }
        const details = this.premiumService.getPremiumStatusDetails(user);
        return { success: true, user, details };
    }
    async exportCsv(connected, res) {
        const isConnected = connected === 'true' ? true : (connected === 'false' ? false : undefined);
        const users = await this.usersService.getAllForExport({ connected: isConnected });
        let csvContent = 'Chat ID,Username,First Name,Connected Connection ID,Is Premium,Premium Expires At,Is Premium Active,Notify Edits,Notify Deletes,Created At,Last Active\n';
        for (const u of users) {
            const uname = u.username ? u.username.replace(/"/g, '""') : '';
            const fname = u.first_name ? u.first_name.replace(/"/g, '""') : '';
            const connId = u.business_connection_id || '';
            const createdAtStr = u.createdAt ? u.createdAt.toISOString() : '';
            const lastActiveStr = u.lastActiveAt ? u.lastActiveAt.toISOString() : '';
            const isPremActive = this.premiumService.isPremiumActive(u);
            const premExpiresStr = u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toISOString() : 'Lifetime';
            csvContent += `${u.chat_id},"${uname}","${fname}",${connId},${u.isPremium || false},"${premExpiresStr}",${isPremActive},${u.notify_edits},${u.notify_deletes},"${createdAtStr}","${lastActiveStr}"\n`;
        }
        res.header('Content-Type', 'text/csv');
        res.attachment('users_export.csv');
        return res.send(csvContent);
    }
    async getMedia(filePath, fileId, res) {
        try {
            if (!filePath && !fileId) {
                return res.status(400).send('File path or file ID is required');
            }
            const response = await this.botService.downloadFile(filePath, fileId);
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            const body = response.body;
            if (!body) {
                return res.status(404).send('Empty file body');
            }
            if (typeof body.pipe === 'function') {
                body.pipe(res);
            }
            else if (typeof body.getReader === 'function') {
                const reader = body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    res.write(Buffer.from(value));
                }
                res.end();
            }
            else {
                const buffer = await response.arrayBuffer();
                res.send(Buffer.from(buffer));
            }
        }
        catch (err) {
            console.error('Media proxy download error:', err);
            res.status(500).send(err.message);
        }
    }
    async getUserChats(chatId) {
        return this.messagesService.getUserChats(Number(chatId));
    }
    async getChatMessages(chatId, targetChatId, page, limit) {
        const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
        const limitNum = Math.max(1, Math.min(200, parseInt(limit || '100', 10) || 100));
        return this.messagesService.getChatMessagesPaginated(Number(chatId), Number(targetChatId), pageNum, limitNum);
    }
    async exportChatPdf(chatId, targetChatId, res) {
        const ownerId = Number(chatId);
        const targetId = Number(targetChatId);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let messages = await this.messagesService.getChatMessagesTimeframe(ownerId, targetId, oneWeekAgo);
        let isFallback = false;
        if (messages.length === 0) {
            messages = await this.messagesService.getChatMessages(ownerId, targetId);
            isFallback = true;
        }
        const chats = await this.messagesService.getUserChats(ownerId);
        const chatInfo = chats.find((c) => c._id === targetId);
        const chatTitle = chatInfo?.chat_title || `Chat_${targetId}`;
        const pdfPath = await (0, chat_pdf_util_1.generateChatPdf)({
            ownerId,
            chatId: targetId,
            chatTitle,
            messages,
            fromDate: isFallback ? undefined : oneWeekAgo,
            toDate: new Date(),
        });
        const fileName = `${chatTitle.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'chat'}_1haftalik.pdf`;
        res.download(pdfPath, fileName, (err) => {
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        });
    }
    async sendMessage(chatId, body) {
        const userChatId = Number(chatId);
        if (isNaN(userChatId)) {
            throw new common_1.BadRequestException('Invalid chatId');
        }
        const messageText = body?.message || body?.text;
        if (!messageText || !messageText.trim()) {
            throw new common_1.BadRequestException('Message content cannot be empty');
        }
        const bot = this.botService.getBotInstance();
        const parseMode = body?.parse_mode !== undefined ? body.parse_mode : 'HTML';
        try {
            if (parseMode) {
                await bot.api.sendMessage(userChatId, messageText.trim(), { parse_mode: parseMode });
            }
            else {
                await bot.api.sendMessage(userChatId, messageText.trim());
            }
        }
        catch (err) {
            try {
                await bot.api.sendMessage(userChatId, messageText.trim());
            }
            catch (fallbackErr) {
                throw new common_1.BadRequestException(`Failed to send message: ${fallbackErr.message || err.message}`);
            }
        }
        return { success: true, message: 'Custom message delivered successfully' };
    }
    async simulateTest(chatId, body) {
        const userChatId = Number(chatId);
        if (isNaN(userChatId)) {
            throw new common_1.BadRequestException('Invalid chatId');
        }
        const messageText = body?.message || body?.text ||
            `🔔 <b>Test Xabarnomasi</b>\n\nTrackMyChatBot tizimidagi sozlamalaringiz to'g'ri ishlayotganini tekshirish uchun ushbu xabar yuborildi.\n\n@TrackMyChatBot`;
        const bot = this.botService.getBotInstance();
        try {
            await bot.api.sendMessage(userChatId, messageText.trim(), { parse_mode: 'HTML' });
        }
        catch (err) {
            try {
                await bot.api.sendMessage(userChatId, messageText.trim());
            }
            catch (fallbackErr) {
                throw new common_1.BadRequestException(`Failed to send message: ${fallbackErr.message || err.message}`);
            }
        }
        return { success: true, message: 'Test message delivered successfully' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('username')),
    __param(4, (0, common_1.Query)('connected')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)(':chatId/premium/enable'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)('expiresAt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "enablePremium", null);
__decorate([
    (0, common_1.Post)(':chatId/premium/disable'),
    __param(0, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "disablePremium", null);
__decorate([
    (0, common_1.Patch)(':chatId/premium'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "togglePremium", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('connected')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('media/download'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Query)('fileId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Get)(':chatId/chats'),
    __param(0, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserChats", null);
__decorate([
    (0, common_1.Get)(':chatId/chats/:targetChatId'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Param)('targetChatId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getChatMessages", null);
__decorate([
    (0, common_1.Get)(':chatId/chats/:targetChatId/export-pdf'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Param)('targetChatId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportChatPdf", null);
__decorate([
    (0, common_1.Post)(':chatId/send-message'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':chatId/simulate-test'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "simulateTest", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => bot_service_1.BotService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        bot_service_1.BotService,
        messages_service_1.MessagesService,
        premium_service_1.PremiumService])
], UsersController);
//# sourceMappingURL=users.controller.js.map