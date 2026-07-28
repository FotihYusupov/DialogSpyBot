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
var BotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const grammy_1 = require("grammy");
const users_service_1 = require("../users/users.service");
const messages_service_1 = require("../messages/messages.service");
const logs_service_1 = require("../logs/logs.service");
const premium_service_1 = require("../premium/premium.service");
const smart_memory_service_1 = require("../memory/smart-memory.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let BotService = BotService_1 = class BotService {
    constructor(configService, usersService, messagesService, logsService, premiumService, smartMemoryService) {
        this.configService = configService;
        this.usersService = usersService;
        this.messagesService = messagesService;
        this.logsService = logsService;
        this.premiumService = premiumService;
        this.smartMemoryService = smartMemoryService;
        this.logger = new common_1.Logger(BotService_1.name);
        this.imagePath = path.resolve(process.cwd(), 'assets', 'instructions.png');
        const token = this.configService.get('BOT_TOKEN');
        if (!token) {
            this.logger.error('❌ BOT_TOKEN not found in environment!');
            process.exit(1);
        }
        this.bot = new grammy_1.Bot(token);
    }
    getBotInstance() {
        return this.bot;
    }
    async downloadFile(filePath, fileId) {
        const token = this.configService.get('BOT_TOKEN');
        if (filePath) {
            const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return response;
                }
                this.logger.warn(`Failed to fetch file using path ${filePath}: ${response.statusText} (${response.status})`);
            }
            catch (err) {
                this.logger.warn(`Fetch error using path ${filePath}: ${err.message}`);
            }
        }
        if (fileId) {
            this.logger.log(`Attempting to refresh file path for fileId: ${fileId}`);
            const file = await this.bot.api.getFile(fileId);
            if (!file.file_path) {
                throw new Error('Telegram API did not return a file path for the file ID.');
            }
            try {
                await this.messagesService.updateFilePathByFileId(fileId, file.file_path);
                this.logger.log(`Successfully updated DB with fresh file path for fileId: ${fileId}`);
            }
            catch (dbErr) {
                this.logger.error(`Failed to update fresh file path in DB: ${dbErr.message}`);
            }
            const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file even with fresh path: ${response.statusText}`);
            }
            return response;
        }
        throw new Error('Could not download file: both path and fileId are invalid or expired.');
    }
    async onApplicationBootstrap() {
        this.logger.log('🤖 Initializing Telegram bot handlers...');
        this.registerHandlers();
        this.bot.start().catch((err) => {
            this.logger.error('❌ Grammy bot error on start:', err);
            this.logsService.logTelegramError('Bot start crash', err.stack);
        });
        this.logger.log('✅ Telegram bot listening for updates');
    }
    async onApplicationShutdown() {
        this.logger.log('⛔ Stopping Telegram bot...');
        await this.bot.stop();
        this.logger.log('✅ Bot stopped');
    }
    escapeHTML(str) {
        if (!str)
            return '';
        return str.replace(/[&<>'"]/g, (tag) => {
            const chars = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;',
            };
            return chars[tag] || tag;
        });
    }
    async extractMedia(msg) {
        let fileId = null;
        let type = null;
        if (msg.photo) {
            fileId = msg.photo[msg.photo.length - 1].file_id;
            type = '📸 Rasm';
        }
        else if (msg.video) {
            fileId = msg.video.file_id;
            type = '🎥 Video';
        }
        else if (msg.voice) {
            fileId = msg.voice.file_id;
            type = '🎤 Voice';
        }
        else if (msg.document) {
            fileId = msg.document.file_id;
            type = '📁 Document';
        }
        else if (msg.sticker) {
            fileId = msg.sticker.file_id;
            type = '👾 Sticker';
        }
        else if (msg.animation) {
            fileId = msg.animation.file_id;
            type = '🎞 GIF';
        }
        else if (msg.video_note) {
            fileId = msg.video_note.file_id;
            type = '📹 Round Video';
        }
        else if (msg.audio) {
            fileId = msg.audio.file_id;
            type = '🎵 Audio';
        }
        if (!fileId) {
            return { type: null, file_id: null, file_path: null };
        }
        try {
            const file = await this.bot.api.getFile(fileId);
            return { type, file_id: fileId, file_path: file.file_path };
        }
        catch (err) {
            this.logger.error(`❌ Error fetching file path: ${err.message}`);
            return { type, file_id: fileId, file_path: null };
        }
    }
    buildMainMenuKeyboard(user) {
        const isPremium = this.premiumService.isPremiumActive(user);
        if (!isPremium) {
            return { remove_keyboard: true };
        }
        return new grammy_1.Keyboard()
            .text('⭐ Saved Items')
            .text('⏰ Reminders')
            .resized();
    }
    async executePremiumFeature(ctx, featureName, action) {
        try {
            if (!ctx.from?.id)
                return;
            const user = await this.usersService.findByChatId(ctx.from.id);
            if (!user || !this.premiumService.isPremiumActive(user)) {
                return ctx.reply(`⭐ <b>Premium Obuna Talab Etiladi</b>\n\n` +
                    `Ushbu xususiyat (<b>${this.escapeHTML(featureName)}</b>) faqat Premium foydalanuvchilar uchun mo'ljallangan.\n\n` +
                    `Premium obunani faollashtirish uchun administrator bilan bog'laning.\n\n@TrackMyChatBot`, { parse_mode: 'HTML' });
            }
            await action(user);
        }
        catch (err) {
            this.logger.error(`Error executing premium feature [${featureName}]: ${err.message}`);
        }
    }
    registerHandlers() {
        const bot = this.bot;
        bot.catch((err) => {
            this.logger.error('❌ Bot crash error:', err.error);
            this.logsService.logTelegramError(err.message, err.stack, { ctx: err.ctx?.update });
        });
        bot.command('start', async (ctx) => {
            try {
                const existingUser = await this.usersService.findByChatId(ctx.from.id);
                const isFirstTime = !existingUser;
                const updatedUser = await this.usersService.createOrUpdate(ctx.from.id, {
                    username: ctx.from.username,
                    first_name: ctx.from.first_name,
                });
                await this.logsService.logActivity('bot_start', ctx.from.id, {
                    username: ctx.from.username,
                    first_name: ctx.from.first_name,
                }).catch((err) => this.logger.error(`Failed to log start activity: ${err.message}`));
                const replyMarkup = this.buildMainMenuKeyboard(updatedUser);
                if (isFirstTime) {
                    const caption = `👋 TrackMyChatBot'ga xush kelibsiz\n\n` +
                        `🕵️ Private chatlarda o‘chirilgan va tahrirlangan xabarlarni kuzatish uchun account’ingizni ulang.\n\n` +
                        `📱 Ulanish yo‘riqnomasi:\n\n` +
                        `1️⃣ Telegram profilingizni oching\n` +
                        `➡️ Profil → Tahrirlash\n\n` +
                        `2️⃣ Pastga scroll qiling\n` +
                        `➡️ Chat Automation bo‘limini toping\n\n` +
                        `3️⃣ @TrackMyChatBot ni kiriting\n` +
                        `➡️ “Ulash” tugmasini bosing\n\n` +
                        `✅ Bot muvaffaqiyatli ulandi.\n` +
                        `⚡ Endi edit va deleted message’lar real-time kuzatiladi.\n\n` +
                        `🔒 Sizning ma’lumotlaringiz xavfsiz saqlanadi.`;
                    try {
                        if (fs.existsSync(this.imagePath)) {
                            await ctx.replyWithPhoto(new grammy_1.InputFile(this.imagePath), { caption, reply_markup: replyMarkup });
                        }
                        else {
                            await ctx.reply(caption, { reply_markup: replyMarkup });
                        }
                    }
                    catch (err) {
                        this.logger.error(`❌ Rasm yuborishda xato: ${err.message}`);
                        await ctx.reply(caption, { reply_markup: replyMarkup });
                    }
                }
                else if (updatedUser.business_connection_id) {
                    await ctx.reply('✅ Telegram accountingiz allaqachon ulangan.\n\n@TrackMyChatBot', { reply_markup: replyMarkup });
                }
                else {
                    await ctx.reply(`👋 Bot ishlayapti.\n\nTelegram Business orqali ulang.\nBuyruqlarni ko'rish uchun /help ni bosing.\n\n@TrackMyChatBot`, { reply_markup: replyMarkup });
                }
            }
            catch (err) {
                this.logger.error(`Start command error: ${err.message}`);
                this.logsService.logTelegramError('start_command_failed', err.stack, { userId: ctx.from?.id });
            }
        });
        bot.command('help', async (ctx) => {
            try {
                const user = await this.usersService.findByChatId(ctx.from.id);
                const isPrem = this.premiumService.isPremiumActive(user);
                let text = `📖 <b>Yordam</b>\n\n` +
                    `/start - Botni ishga tushirish\n` +
                    `/stats - Statistika\n` +
                    `/settings - Sozlamalar (Xabarnomalarni o'chirish/yoqish)\n` +
                    `/search &lt;so'z&gt; - Xabarlarni izlash\n` +
                    `/export - Ma'lumotlarni yuklab olish\n`;
                if (isPrem) {
                    text +=
                        `⭐ /saved - Saqlangan xabarlar (Premium)\n` +
                            `⏰ /reminders - Eslatmalar (Premium)\n`;
                }
                text += `/help - Shu xabarni ko'rsatish\n\n@TrackMyChatBot`;
                await ctx.reply(text, { parse_mode: 'HTML', reply_markup: this.buildMainMenuKeyboard(user) });
            }
            catch (err) {
                this.logger.error(`Help command error: ${err.message}`);
            }
        });
        bot.hears('⭐ Saved Items', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Saved Items', async () => {
                await ctx.reply('⭐ <b>Saved Items</b>\n\nSiz saqlagan xabarlar ro\'yxati hozircha bo\'sh.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.command('saved', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Saved Items', async () => {
                await ctx.reply('⭐ <b>Saved Items</b>\n\nSiz saqlagan xabarlar ro\'yxati hozircha bo\'sh.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.hears('⏰ Reminders', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Reminders', async () => {
                await ctx.reply('⏰ <b>Reminders</b>\n\nFaol eslatmalar mavjud emas.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.command('reminders', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Reminders', async () => {
                await ctx.reply('⏰ <b>Reminders</b>\n\nFaol eslatmalar mavjud emas.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.command('aisearch', async (ctx) => {
            await this.executePremiumFeature(ctx, 'AI Search', async () => {
                await ctx.reply('🤖 <b>AI Search</b>\n\nSun\'iy intellekt orqali qidiruv tizimi.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.command('insights', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Smart Insights', async () => {
                await ctx.reply('💡 <b>Smart Insights</b>\n\nChat tahlillari va tushunchalari.\n\n@TrackMyChatBot', { parse_mode: 'HTML' });
            });
        });
        bot.command('collections', async (ctx) => {
            await this.executePremiumFeature(ctx, 'Collections', async () => {
                await ctx.reply(`📁 <b>Collections</b>\n\nXabarlar to'plamlari.\n\n@TrackMyChatBot`, { parse_mode: 'HTML' });
            });
        });
        bot.command('settings', async (ctx) => {
            try {
                const user = await this.usersService.findByChatId(ctx.from.id);
                if (!user)
                    return ctx.reply("❌ Avval /start tugmasini bosing.");
                const keyboard = new grammy_1.InlineKeyboard()
                    .text(user.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
                    .text(user.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');
                await ctx.reply('⚙️ <b>Sozlamalar</b>\nQaysi xabarnomalarni olmoqchisiz?\n\n@TrackMyChatBot', {
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                });
            }
            catch (err) {
                this.logger.error(`Settings command error: ${err.message}`);
            }
        });
        bot.on('callback_query:data', async (ctx) => {
            try {
                const data = ctx.callbackQuery.data;
                const user = await this.usersService.findByChatId(ctx.from.id);
                if (!user)
                    return ctx.answerCallbackQuery('Foydalanuvchi topilmadi.');
                if (data === 'toggle_deletes') {
                    await this.usersService.toggleNotification(user.chat_id, 'deletes');
                }
                else if (data === 'toggle_edits') {
                    await this.usersService.toggleNotification(user.chat_id, 'edits');
                }
                const updated = await this.usersService.findByChatId(user.chat_id);
                if (!updated)
                    return;
                const keyboard = new grammy_1.InlineKeyboard()
                    .text(updated.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
                    .text(updated.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');
                await ctx.editMessageReplyMarkup({ reply_markup: keyboard }).catch(() => { });
                await ctx.answerCallbackQuery('Sozlamalar saqlandi.');
            }
            catch (err) {
                this.logger.error(`Callback query error: ${err.message}`);
            }
        });
        bot.command('search', async (ctx) => {
            try {
                const user = await this.usersService.findByChatId(ctx.from.id);
                if (!user || !user.business_connection_id) {
                    return ctx.reply('❌ Business account ulanmagan.');
                }
                const query = ctx.match;
                if (!query) {
                    return ctx.reply("❌ Nimani izlamoqchisiz? Masalan: /search salom");
                }
                const results = await this.messagesService.search(user.business_connection_id, query, 10);
                if (results.length === 0) {
                    return ctx.reply('🔍 Hech narsa topilmadi.');
                }
                let text = `🔍 <b>Natijalar (${results.length} ta ko'rsatilmoqda)</b>\n\n`;
                results.forEach((msg, i) => {
                    let status = msg.is_deleted ? "🗑 O'chirilgan" : (msg.is_edited ? "✏️ Tahrirlangan" : "💬 Oddiy");
                    text += `${i + 1}. [${status}] ${this.escapeHTML(msg.sender_first_name)}: <i>${this.escapeHTML((msg.text || '[Media]').substring(0, 50))}...</i>\n`;
                });
                text += `\n@TrackMyChatBot`;
                await ctx.reply(text, { parse_mode: 'HTML' });
            }
            catch (err) {
                this.logger.error(`Search command error: ${err.message}`);
            }
        });
        bot.command('export', async (ctx) => {
            try {
                const user = await this.usersService.findByChatId(ctx.from.id);
                if (!user || !user.business_connection_id) {
                    return ctx.reply('❌ Business account ulanmagan.');
                }
                const messages = await this.messagesService.getDeletedAndEditedForExport(user.business_connection_id);
                if (messages.length === 0) {
                    return ctx.reply("📂 Eksport qilish uchun o'chirilgan yoki tahrirlangan xabarlar yo'q.");
                }
                const filePath = path.join(process.cwd(), `export_${ctx.from.id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
                await ctx.replyWithDocument(new grammy_1.InputFile(filePath), { caption: "📂 O'chirilgan va tahrirlangan xabarlar" });
                fs.unlinkSync(filePath);
            }
            catch (err) {
                this.logger.error(`Export command error: ${err.message}`);
            }
        });
        bot.command('stats', async (ctx) => {
            try {
                const user = await this.usersService.findByChatId(ctx.from.id);
                if (!user || !user.business_connection_id) {
                    return ctx.reply('❌ Business account ulanmagan.');
                }
                const total = await this.messagesService.countTotal(user.chat_id, user.business_connection_ids, user.business_connection_id);
                const deleted = await this.messagesService.countDeleted(user.chat_id, user.business_connection_ids, user.business_connection_id);
                const edited = await this.messagesService.countEdited(user.chat_id, user.business_connection_ids, user.business_connection_id);
                const text = `📊 <b>Statistika</b>\n\n` +
                    `📥 Jami: <b>${total}</b>\n` +
                    `🗑 Deleted: <b>${deleted}</b>\n` +
                    `✏️ Edited: <b>${edited}</b>\n\n` +
                    `@TrackMyChatBot`;
                await ctx.reply(text, { parse_mode: 'HTML' });
            }
            catch (err) {
                this.logger.error(`Stats command error: ${err.message}`);
            }
        });
        bot.on('business_connection', async (ctx) => {
            try {
                const conn = ctx.businessConnection;
                if (conn.is_enabled) {
                    await this.usersService.createOrUpdate(conn.user.id, {
                        business_connection_id: conn.id,
                    });
                    const user = await this.usersService.findByChatId(conn.user.id);
                    if (user) {
                        if (!user.business_connection_ids.includes(conn.id)) {
                            user.business_connection_ids.push(conn.id);
                            await user.save();
                        }
                    }
                    this.logger.log(`✅ Business connected: ${conn.id}`);
                    await this.logsService.logActivity('business_connected', conn.user.id, {
                        username: conn.user.username,
                        first_name: conn.user.first_name,
                    }, { connection_id: conn.id }).catch((err) => this.logger.error(`Failed to log business connected activity: ${err.message}`));
                }
                else {
                    await this.usersService.disconnectBusiness(conn.id);
                    this.logger.log(`❌ Business disconnected: ${conn.id}`);
                    await this.logsService.logActivity('business_disconnected', conn.user.id, {
                        username: conn.user.username,
                        first_name: conn.user.first_name,
                    }, { connection_id: conn.id }).catch((err) => this.logger.error(`Failed to log business disconnected activity: ${err.message}`));
                }
            }
            catch (err) {
                this.logger.error(`Business connection error: ${err.message}`);
                this.logsService.logTelegramError('business_connection_update_failed', err.stack, { connection: ctx.businessConnection });
            }
        });
        bot.on('business_message', async (ctx) => {
            try {
                const msg = ctx.businessMessage;
                let owner_id = null;
                const user = await this.usersService.findByConnectionId(msg.business_connection_id);
                if (user) {
                    owner_id = user.chat_id;
                }
                else {
                    try {
                        const conn = await ctx.api.getBusinessConnection(msg.business_connection_id);
                        owner_id = conn.user.id;
                        await this.usersService.createOrUpdate(owner_id, {
                            business_connection_id: conn.id,
                        });
                        const updatedUser = await this.usersService.findByChatId(owner_id);
                        if (updatedUser) {
                            if (!updatedUser.business_connection_ids.includes(conn.id)) {
                                updatedUser.business_connection_ids.push(conn.id);
                                await updatedUser.save();
                            }
                        }
                    }
                    catch (err) {
                        this.logger.error(`Could not fetch connection info: ${err.message}`);
                    }
                }
                const mediaInfo = await this.extractMedia(msg);
                await this.messagesService.create({
                    owner_id: owner_id || undefined,
                    business_connection_id: msg.business_connection_id,
                    message_id: msg.message_id,
                    chat_id: msg.chat.id,
                    chat_title: msg.chat.title ||
                        (msg.chat.type === 'private'
                            ? `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim() || msg.chat.username || 'Shaxsiy chat'
                            : 'Shaxsiy chat'),
                    chat_type: msg.chat.type,
                    sender_id: msg.from.id,
                    sender_first_name: msg.from.first_name || '',
                    sender_last_name: msg.from.last_name || '',
                    sender_username: msg.from.username || '',
                    text: msg.text || msg.caption || '',
                    media_type: mediaInfo.type || undefined,
                    media_file_id: mediaInfo.file_id || undefined,
                    media_file_path: mediaInfo.file_path || undefined,
                });
                this.logger.log('✅ Message saved');
                if (owner_id) {
                    this.smartMemoryService.processIncomingMessage({
                        ownerId: owner_id,
                        messageId: msg.message_id,
                        chatId: msg.chat.id,
                        senderId: msg.from.id,
                        senderFirstName: msg.from.first_name || '',
                        senderLastName: msg.from.last_name || '',
                        senderUsername: msg.from.username || '',
                        text: msg.text || msg.caption || '',
                        date: new Date(msg.date * 1000),
                    }).catch((err) => this.logger.error(`Smart Memory processing error: ${err.message}`));
                }
            }
            catch (err) {
                this.logger.error(`Save message error: ${err.message}`);
                this.logsService.logTelegramError('save_message_failed', err.stack, { messageId: ctx.businessMessage?.message_id });
            }
        });
        bot.on('deleted_business_messages', async (ctx) => {
            try {
                const deletedData = ctx.deletedBusinessMessages;
                for (const msgId of deletedData.message_ids) {
                    const archived = await this.messagesService.markDeleted(deletedData.business_connection_id, msgId);
                    if (!archived)
                        continue;
                    let owner = null;
                    if (archived.owner_id) {
                        owner = await this.usersService.findByChatId(archived.owner_id);
                    }
                    else {
                        owner = await this.usersService.findByConnectionId(deletedData.business_connection_id);
                    }
                    if (!owner || owner.notify_deletes === false)
                        continue;
                    let fullName = this.escapeHTML(archived.sender_first_name);
                    if (archived.sender_last_name) {
                        fullName += ' ' + this.escapeHTML(archived.sender_last_name);
                    }
                    const usernameText = archived.sender_username
                        ? ` (@${this.escapeHTML(archived.sender_username)})`
                        : '';
                    const caption = `🗑 <b>Xabar o'chirildi!</b>\n\n` +
                        `👤 <b>Kimdan:</b> <a href="tg://user?id=${archived.sender_id}">${fullName}</a>${usernameText}\n` +
                        `🏠 <b>Chat:</b> ${this.escapeHTML(archived.chat_title)}\n\n` +
                        `💬 <b>Matn:</b>\n` +
                        `<i>${this.escapeHTML(archived.text || '[Media]')}</i>\n\n` +
                        `@TrackMyChatBot`;
                    try {
                        if (archived.media_type?.includes('Rasm')) {
                            await bot.api.sendPhoto(owner.chat_id, archived.media_file_id, { caption, parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Video')) {
                            await bot.api.sendVideo(owner.chat_id, archived.media_file_id, { caption, parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Voice')) {
                            await bot.api.sendVoice(owner.chat_id, archived.media_file_id, { caption, parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Document')) {
                            await bot.api.sendDocument(owner.chat_id, archived.media_file_id, { caption, parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Sticker')) {
                            await bot.api.sendSticker(owner.chat_id, archived.media_file_id);
                            await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Round Video')) {
                            await bot.api.sendVideoNote(owner.chat_id, archived.media_file_id);
                            await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
                        }
                        else if (archived.media_type?.includes('Audio')) {
                            await bot.api.sendAudio(owner.chat_id, archived.media_file_id, { caption, parse_mode: 'HTML' });
                        }
                        else {
                            await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
                        }
                    }
                    catch (err) {
                        this.logger.error(`❌ Send deleted message notification error: ${err.message}`);
                    }
                }
            }
            catch (err) {
                this.logger.error(`Delete event processing error: ${err.message}`);
            }
        });
        bot.on('edited_business_message', async (ctx) => {
            try {
                const editedMsg = ctx.editedBusinessMessage;
                const oldMsg = await this.messagesService.findOne(editedMsg.business_connection_id, editedMsg.message_id);
                if (!oldMsg)
                    return;
                let owner = null;
                if (oldMsg.owner_id) {
                    owner = await this.usersService.findByChatId(oldMsg.owner_id);
                }
                else {
                    owner = await this.usersService.findByConnectionId(editedMsg.business_connection_id);
                }
                if (!owner || owner.notify_edits === false)
                    return;
                const mediaInfo = await this.extractMedia(editedMsg);
                let fullName = this.escapeHTML(editedMsg.from.first_name);
                if (editedMsg.from.last_name) {
                    fullName += ' ' + this.escapeHTML(editedMsg.from.last_name);
                }
                const usernameText = editedMsg.from.username
                    ? ` (@${this.escapeHTML(editedMsg.from.username)})`
                    : '';
                const newText = editedMsg.text || editedMsg.caption || '';
                const report = `✏️ <b>Xabar tahrirlandi!</b>\n\n` +
                    `👤 <b>Kimdan:</b> <a href="tg://user?id=${editedMsg.from.id}">${fullName}</a>${usernameText}\n\n` +
                    `❌ <b>Eski:</b>\n` +
                    `<i>${this.escapeHTML(oldMsg.text)}</i>\n\n` +
                    `✅ <b>Yangi:</b>\n` +
                    `<i>${this.escapeHTML(newText)}</i>\n\n` +
                    `@TrackMyChatBot`;
                await bot.api.sendMessage(owner.chat_id, report, { parse_mode: 'HTML' });
                oldMsg.edit_history.push({ text: oldMsg.text || '', date: new Date() });
                oldMsg.text = newText;
                oldMsg.is_edited = true;
                oldMsg.media_type = mediaInfo.type || undefined;
                oldMsg.media_file_id = mediaInfo.file_id || undefined;
                oldMsg.media_file_path = mediaInfo.file_path || undefined;
                await oldMsg.save();
                this.logger.log('✏️ Message updated');
            }
            catch (err) {
                this.logger.error(`Edit event error: ${err.message}`);
                this.logsService.logTelegramError('edit_message_failed', err.stack, { messageId: ctx.editedBusinessMessage?.message_id });
            }
        });
    }
};
exports.BotService = BotService;
exports.BotService = BotService = BotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        messages_service_1.MessagesService,
        logs_service_1.LogsService,
        premium_service_1.PremiumService,
        smart_memory_service_1.SmartMemoryService])
], BotService);
//# sourceMappingURL=bot.service.js.map