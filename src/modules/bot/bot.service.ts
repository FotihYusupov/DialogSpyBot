import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { LogsService } from '../logs/logs.service';
import { PremiumService } from '../premium/premium.service';
import { SmartMemoryService } from '../memory/smart-memory.service';
import { SavedMessagesService } from '../saved/saved-messages.service';
import { RemindersService } from '../reminders/reminders.service';
import * as path from 'path';
import * as fs from 'fs';
import { generateChatPdf } from './utils/chat-pdf.util';

@Injectable()
export class BotService implements OnApplicationBootstrap, OnApplicationShutdown {
  private bot: Bot;
  private readonly logger = new Logger(BotService.name);
  private imagePath = path.resolve(process.cwd(), 'assets', 'instructions.png');

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private messagesService: MessagesService,
    private logsService: LogsService,
    private premiumService: PremiumService,
    private smartMemoryService: SmartMemoryService,
    private savedMessagesService: SavedMessagesService,
    private remindersService: RemindersService,
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      this.logger.error('❌ BOT_TOKEN not found in environment!');
      process.exit(1);
    }
    this.bot = new Bot(token);
  }

  getBotInstance(): Bot {
    return this.bot;
  }

  async downloadFile(filePath?: string, fileId?: string) {
    const token = this.configService.get<string>('BOT_TOKEN');

    if (filePath) {
      const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          return response;
        }
        this.logger.warn(`Failed to fetch file using path ${filePath}: ${response.statusText} (${response.status})`);
      } catch (err: any) {
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
      } catch (dbErr: any) {
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

  /**
   * Har daqiqada eslatmalarni tekshirib, vaqti kelganlarini yuborish
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders() {
    try {
      const dueReminders = await this.remindersService.findDueReminders();
      if (dueReminders.length === 0) return;

      for (const reminder of dueReminders) {
        try {
          await this.bot.api.sendMessage(
            reminder.owner_id,
            `⏰ <b>Eslatma!</b>\n\n${this.escapeHTML(reminder.text)}\n\n@TrackMyChatBot`,
            { parse_mode: 'HTML' }
          );
          await this.remindersService.markSent(String(reminder._id));
          this.logger.log(`✅ Reminder sent to user ${reminder.owner_id}`);
        } catch (err: any) {
          this.logger.error(`❌ Failed to send reminder ${reminder._id}: ${err.message}`);
          // Xato bo'lsa ham yuborilgan deb belgilaymiz (qayta urinmaslik uchun)
          await this.remindersService.markSent(String(reminder._id));
        }
      }
    } catch (err: any) {
      this.logger.error(`Reminder cron error: ${err.message}`);
    }
  }

  private escapeHTML(str?: string): string {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, (tag) => {
      const chars: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return chars[tag] || tag;
    });
  }

  private async extractMedia(msg: any) {
    let fileId: string | null = null;
    let type: string | null = null;

    if (msg.photo) {
      fileId = msg.photo[msg.photo.length - 1].file_id;
      type = '📸 Rasm';
    } else if (msg.video) {
      fileId = msg.video.file_id;
      type = '🎥 Video';
    } else if (msg.voice) {
      fileId = msg.voice.file_id;
      type = '🎤 Voice';
    } else if (msg.document) {
      fileId = msg.document.file_id;
      type = '📁 Document';
    } else if (msg.sticker) {
      fileId = msg.sticker.file_id;
      type = '👾 Sticker';
    } else if (msg.animation) {
      fileId = msg.animation.file_id;
      type = '🎞 GIF';
    } else if (msg.video_note) {
      fileId = msg.video_note.file_id;
      type = '📹 Round Video';
    } else if (msg.audio) {
      fileId = msg.audio.file_id;
      type = '🎵 Audio';
    }

    if (!fileId) {
      return { type: null, file_id: null, file_path: null };
    }

    try {
      const file = await this.bot.api.getFile(fileId);
      return { type, file_id: fileId, file_path: file.file_path };
    } catch (err: any) {
      this.logger.error(`❌ Error fetching file path: ${err.message}`);
      return { type, file_id: fileId, file_path: null };
    }
  }

  private buildMainMenuKeyboard(user?: any) {
    const isPremium = this.premiumService.isPremiumActive(user);

    const keyboard = new Keyboard()
      .text('💬 Chatlar Tarixi (PDF)')
      .row();

    if (isPremium) {
      keyboard
        .text('⭐ Saqlangan Xabarlar')
        .text('⏰ Eslatmalar')
        .row();
    }

    return keyboard.resized();
  }

  private async executePremiumFeature(ctx: any, featureName: string, action: (user: any) => Promise<void>) {
    try {
      if (!ctx.from?.id) return;
      const user = await this.usersService.findByChatId(ctx.from.id);

      if (!user || !this.premiumService.isPremiumActive(user)) {
        return ctx.reply(
          `⭐ <b>Premium Obuna Talab Etiladi</b>\n\n` +
          `Ushbu xususiyat (<b>${this.escapeHTML(featureName)}</b>) faqat Premium foydalanuvchilar uchun mo'ljallangan.\n\n` +
          `Premium obunani faollashtirish uchun administrator bilan bog'laning.\n\n@TrackMyChatBot`,
          { parse_mode: 'HTML' }
        );
      }

      await action(user);
    } catch (err: any) {
      this.logger.error(`Error executing premium feature [${featureName}]: ${err.message}`);
    }
  }

  private formatRemindAt(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 60) {
      return `${diffMin} daqiqadan keyin`;
    } else if (diffMin < 1440) {
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      return mins > 0 ? `${hours} soat ${mins} daqiqadan keyin` : `${hours} soatdan keyin`;
    } else {
      return date.toLocaleString('uz-UZ', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  }

  private registerHandlers() {
    const bot = this.bot;

    bot.catch((err) => {
      this.logger.error('❌ Bot crash error:', err.error);
      this.logsService.logTelegramError(err.message, err.stack, { ctx: err.ctx?.update });
    });

    // ==================== /start ====================
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
          const caption =
            `👋 TrackMyChatBot'ga xush kelibsiz!\n\n` +
            `🕵️ Private chatlarda o'chirilgan va tahrirlangan xabarlarni kuzatish uchun accountingizni ulang.\n\n` +
            `📱 Ulanish yo'riqnomasi:\n\n` +
            `1️⃣ Telegram profilingizni oching\n` +
            `➡️ Profil → Tahrirlash\n\n` +
            `2️⃣ Pastga scroll qiling\n` +
            `➡️ Chat Automation bo'limini toping\n\n` +
            `3️⃣ @TrackMyChatBot ni kiriting\n` +
            `➡️ "Ulash" tugmasini bosing\n\n` +
            `✅ Bot muvaffaqiyatli ulandi.\n` +
            `⚡ Endi edit va deleted xabarlar real-time kuzatiladi.\n\n` +
            `🔒 Ma'lumotlaringiz xavfsiz saqlanadi.`;

          try {
            if (fs.existsSync(this.imagePath)) {
              await ctx.replyWithPhoto(new InputFile(this.imagePath), { caption, reply_markup: replyMarkup });
            } else {
              await ctx.reply(caption, { reply_markup: replyMarkup });
            }
          } catch (err: any) {
            this.logger.error(`❌ Rasm yuborishda xato: ${err.message}`);
            await ctx.reply(caption, { reply_markup: replyMarkup });
          }
        } else if (updatedUser.business_connection_id) {
          await ctx.reply('✅ Telegram accountingiz allaqachon ulangan.\n\n@TrackMyChatBot', { reply_markup: replyMarkup });
        } else {
          await ctx.reply(
            `👋 Bot ishlayapti.\n\nTelegram Business orqali ulang.\nBuyruqlarni ko'rish uchun /help ni bosing.\n\n@TrackMyChatBot`,
            { reply_markup: replyMarkup }
          );
        }
      } catch (err: any) {
        this.logger.error(`Start command error: ${err.message}`);
        this.logsService.logTelegramError('start_command_failed', err.stack, { userId: ctx.from?.id });
      }
    });

    // ==================== /help ====================
    bot.command('help', async (ctx) => {
      try {
        const user = await this.usersService.findByChatId(ctx.from.id);
        const isPrem = this.premiumService.isPremiumActive(user);

        let text =
          `📖 <b>Yordam</b>\n\n` +
          `/start - Botni ishga tushirish\n` +
          `/chats - Saqlangan chatlar ro'yxati va 1 haftalik chatni yuklab olish (PDF)\n` +
          `/stats - Statistika\n` +
          `/settings - Sozlamalar (bildirishnomalarni o'chirish/yoqish)\n` +
          `/search &lt;so'z&gt; - Xabarlarni izlash\n` +
          `/export - Ma'lumotlarni yuklab olish\n`;

        if (isPrem) {
          text +=
            `⭐ /saved - Saqlangan xabarlar (Premium)\n` +
            `⏰ /eslatma &lt;vaqt&gt; &lt;matn&gt; - Eslatma qo'shish (Premium)\n` +
            `⏰ /reminders - Eslatmalar ro'yxati (Premium)\n`;
        }

        text += `/help - Shu xabarni ko'rsatish\n\n@TrackMyChatBot`;
        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: this.buildMainMenuKeyboard(user) });
      } catch (err: any) {
        this.logger.error(`Help command error: ${err.message}`);
      }
    });

    // ==================== 💬 CHAT HISTORY & EXPORT ====================
    bot.hears(['💬 Chatlar Tarixi (PDF)', '💬 Chatlar Tarixi', 'Chatlar Tarixi'], async (ctx) => {
      await this.showUserChats(ctx, 1);
    });

    bot.command(['chats', 'chatlar', 'history'], async (ctx) => {
      await this.showUserChats(ctx, 1);
    });

    // ==================== ⭐ SAVED ITEMS ====================
    bot.hears(['⭐ Saqlangan Xabarlar', '⭐ Saved Items'], async (ctx) => {
      await this.executePremiumFeature(ctx, 'Saqlangan Xabarlar', async () => {
        await this.showSavedMessages(ctx, 1);
      });
    });

    bot.command('saved', async (ctx) => {
      await this.executePremiumFeature(ctx, 'Saqlangan Xabarlar', async () => {
        await this.showSavedMessages(ctx, 1);
      });
    });

    // ==================== ⏰ REMINDERS ====================
    bot.hears(['⏰ Eslatmalar', '⏰ Reminders'], async (ctx) => {
      await this.executePremiumFeature(ctx, 'Eslatmalar', async () => {
        await this.showReminders(ctx);
      });
    });

    bot.command('reminders', async (ctx) => {
      await this.executePremiumFeature(ctx, 'Eslatmalar', async () => {
        await this.showReminders(ctx);
      });
    });

    // Yangi eslatma qo'shish: /eslatma 30m Shifokorga boring
    bot.command(['eslatma', 'remind'], async (ctx) => {
      await this.executePremiumFeature(ctx, 'Eslatmalar', async () => {
        const input = ctx.match?.trim();
        if (!input) {
          await ctx.reply(
            `⏰ <b>Eslatma qo'shish</b>\n\n` +
            `📌 Format:\n` +
            `<code>/eslatma 30m Shifokorga boring</code>\n` +
            `<code>/eslatma 2s Uchrashuv bor</code>\n` +
            `<code>/eslatma 1kun Loyihani topshir</code>\n` +
            `<code>/eslatma 15:30 Kechki ovqat</code>\n\n` +
            `⏱ Vaqt formatlari: <code>m</code>=daqiqa, <code>s</code>=soat, <code>kun</code>=kun`,
            { parse_mode: 'HTML' }
          );
          return;
        }

        const parsed = this.remindersService.parseReminderText(input);
        if (parsed.error || !parsed.remindAt) {
          await ctx.reply(`❌ ${parsed.error || "Vaqt formatini tekshiring."}`, { parse_mode: 'HTML' });
          return;
        }

        const activeCount = await this.remindersService.countActiveByOwner(ctx.from.id);
        if (activeCount >= 20) {
          await ctx.reply(`❌ Maksimal 20 ta faol eslatma bo'lishi mumkin.\n\nEski eslatmalarni /reminders orqali o'chiring.`);
          return;
        }

        await this.remindersService.create(ctx.from.id, parsed.text, parsed.remindAt);

        await ctx.reply(
          `✅ <b>Eslatma saqlandi!</b>\n\n` +
          `📝 Matn: <i>${this.escapeHTML(parsed.text)}</i>\n` +
          `⏰ Vaqt: <b>${this.formatRemindAt(parsed.remindAt)}</b>\n\n` +
          `@TrackMyChatBot`,
          { parse_mode: 'HTML' }
        );
      });
    });

    // ==================== Settings ====================
    bot.command('settings', async (ctx) => {
      try {
        const user = await this.usersService.findByChatId(ctx.from.id);
        if (!user) return ctx.reply("❌ Avval /start tugmasini bosing.");

        const keyboard = new InlineKeyboard()
          .text(user.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
          .text(user.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');

        await ctx.reply('⚙️ <b>Sozlamalar</b>\nQaysi bildirishnomalarni olmoqchisiz?\n\n@TrackMyChatBot', {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (err: any) {
        this.logger.error(`Settings command error: ${err.message}`);
      }
    });

    // ==================== Callback Queries ====================
    bot.on('callback_query:data', async (ctx) => {
      try {
        const data = ctx.callbackQuery.data;
        const user = await this.usersService.findByChatId(ctx.from.id);
        if (!user) return ctx.answerCallbackQuery('Foydalanuvchi topilmadi.');

        // Toggle bildirishnomalar
        if (data === 'toggle_deletes') {
          await this.usersService.toggleNotification(user.chat_id, 'deletes');
          const updated = await this.usersService.findByChatId(user.chat_id);
          if (!updated) return;
          const keyboard = new InlineKeyboard()
            .text(updated.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
            .text(updated.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');
          await ctx.editMessageReplyMarkup({ reply_markup: keyboard }).catch(() => {});
          await ctx.answerCallbackQuery('Sozlamalar saqlandi.');
          return;
        }

        if (data === 'toggle_edits') {
          await this.usersService.toggleNotification(user.chat_id, 'edits');
          const updated = await this.usersService.findByChatId(user.chat_id);
          if (!updated) return;
          const keyboard = new InlineKeyboard()
            .text(updated.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
            .text(updated.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');
          await ctx.editMessageReplyMarkup({ reply_markup: keyboard }).catch(() => {});
          await ctx.answerCallbackQuery('Sozlamalar saqlandi.');
          return;
        }

        // Saqlangan xabarni o'chirish
        if (data.startsWith('del_saved_')) {
          const savedId = data.replace('del_saved_', '');
          const deleted = await this.savedMessagesService.deleteById(savedId, ctx.from.id);
          if (deleted) {
            await ctx.editMessageText('🗑 Xabar saqlangan ro\'yxatdan o\'chirildi.\n\n@TrackMyChatBot').catch(() => {});
            await ctx.answerCallbackQuery('O\'chirildi.');
          } else {
            await ctx.answerCallbackQuery('Topilmadi yoki sizning xabaringiz emas.');
          }
          return;
        }

        // Saqlangan xabarlar sahifalash
        if (data.startsWith('saved_page_')) {
          const page = parseInt(data.replace('saved_page_', ''), 10);
          await ctx.answerCallbackQuery();
          await this.showSavedMessages(ctx, page, true);
          return;
        }

        // Eslatmani bekor qilish
        if (data.startsWith('cancel_reminder_')) {
          const reminderId = data.replace('cancel_reminder_', '');
          const cancelled = await this.remindersService.cancel(reminderId, ctx.from.id);
          if (cancelled) {
            await ctx.editMessageText('✅ Eslatma bekor qilindi.\n\n@TrackMyChatBot').catch(() => {});
            await ctx.answerCallbackQuery('Bekor qilindi.');
          } else {
            await ctx.answerCallbackQuery('Topilmadi yoki allaqachon yuborilgan.');
          }
          return;
        }

        // Xabarni saqlash (bildirishnomadagi ⭐ Saqlash tugmasi)
        if (data.startsWith('save_msg_')) {
          const msgMongoId = data.replace('save_msg_', '');
          if (!this.premiumService.isPremiumActive(user)) {
            await ctx.answerCallbackQuery('⭐ Bu funksiya Premium uchun.');
            return;
          }
          const archived = await this.messagesService.findByMongoId(msgMongoId);
          if (!archived) {
            await ctx.answerCallbackQuery('Xabar topilmadi.');
            return;
          }
          if (archived.message_id) {
            const alreadySaved = await this.savedMessagesService.isAlreadySaved(ctx.from.id, archived.message_id);
            if (alreadySaved) {
              await ctx.answerCallbackQuery('Bu xabar allaqachon saqlangan!');
              return;
            }
          }
          await this.savedMessagesService.save({
            owner_id: ctx.from.id,
            business_connection_id: archived.business_connection_id,
            original_message_id: archived.message_id,
            chat_id: archived.chat_id,
            chat_title: archived.chat_title,
            sender_id: archived.sender_id,
            sender_first_name: archived.sender_first_name,
            sender_last_name: archived.sender_last_name,
            sender_username: archived.sender_username,
            text: archived.text,
            media_type: archived.media_type,
            media_file_id: archived.media_file_id,
          });
          await ctx.answerCallbackQuery('⭐ Saqlandi!');
          await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard().text('✅ Saqlangan', 'noop') }).catch(() => {});
          return;
        }

        if (data === 'noop') {
          await ctx.answerCallbackQuery();
          return;
        }

        // Chatlar ro'yxati sahifalash
        if (data.startsWith('chats_page_')) {
          const page = parseInt(data.replace('chats_page_', ''), 10);
          await ctx.answerCallbackQuery();
          await this.showUserChats(ctx, page, true);
          return;
        }

        // 1 haftalik chatni PDF qilib yuklab olish
        if (data.startsWith('dl_chat_')) {
          const targetChatId = Number(data.replace('dl_chat_', ''));
          await ctx.answerCallbackQuery('PDF tayyorlanmoqda, iltimos kuting...');
          await this.handleDownloadChatPdf(ctx, targetChatId);
          return;
        }

        await ctx.answerCallbackQuery();
      } catch (err: any) {
        this.logger.error(`Callback query error: ${err.message}`);
      }
    });

    // ==================== /search ====================
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
      } catch (err: any) {
        this.logger.error(`Search command error: ${err.message}`);
      }
    });

    // ==================== /export ====================
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

        await ctx.replyWithDocument(new InputFile(filePath), { caption: "📂 O'chirilgan va tahrirlangan xabarlar" });
        fs.unlinkSync(filePath);
      } catch (err: any) {
        this.logger.error(`Export command error: ${err.message}`);
      }
    });

    // ==================== /stats ====================
    bot.command('stats', async (ctx) => {
      try {
        const user = await this.usersService.findByChatId(ctx.from.id);
        if (!user || !user.business_connection_id) {
          return ctx.reply('❌ Business account ulanmagan.');
        }

        const total = await this.messagesService.countTotal(user.chat_id, user.business_connection_ids, user.business_connection_id);
        const deleted = await this.messagesService.countDeleted(user.chat_id, user.business_connection_ids, user.business_connection_id);
        const edited = await this.messagesService.countEdited(user.chat_id, user.business_connection_ids, user.business_connection_id);

        const text =
          `📊 <b>Statistika</b>\n\n` +
          `📥 Jami xabarlar: <b>${total}</b>\n` +
          `🗑 O'chirilgan: <b>${deleted}</b>\n` +
          `✏️ Tahrirlangan: <b>${edited}</b>\n\n` +
          `@TrackMyChatBot`;

        await ctx.reply(text, { parse_mode: 'HTML' });
      } catch (err: any) {
        this.logger.error(`Stats command error: ${err.message}`);
      }
    });

    // ==================== Premium stub buyruqlar ====================
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

    // ==================== Business Connection ====================
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
          }, { connection_id: conn.id }).catch((err) =>
            this.logger.error(`Failed to log business connected activity: ${err.message}`)
          );
        } else {
          await this.usersService.disconnectBusiness(conn.id);
          this.logger.log(`❌ Business disconnected: ${conn.id}`);

          await this.logsService.logActivity('business_disconnected', conn.user.id, {
            username: conn.user.username,
            first_name: conn.user.first_name,
          }, { connection_id: conn.id }).catch((err) =>
            this.logger.error(`Failed to log business disconnected activity: ${err.message}`)
          );
        }
      } catch (err: any) {
        this.logger.error(`Business connection error: ${err.message}`);
        this.logsService.logTelegramError('business_connection_update_failed', err.stack, { connection: ctx.businessConnection });
      }
    });

    // ==================== Business Message (xabar saqlash) ====================
    bot.on('business_message', async (ctx) => {
      try {
        const msg = ctx.businessMessage;

        let owner_id: number | null = null;
        const user = await this.usersService.findByConnectionId(msg.business_connection_id);

        if (user) {
          owner_id = user.chat_id;
        } else {
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
          } catch (err: any) {
            this.logger.error(`Could not fetch connection info: ${err.message}`);
          }
        }

        const mediaInfo = await this.extractMedia(msg);

        // BUG #9 FIX: Telegram msg.date Unix timestamp (seconds) → Date obyektiga aylantirish
        await this.messagesService.create({
          owner_id: owner_id || undefined,
          business_connection_id: msg.business_connection_id,
          message_id: msg.message_id,
          chat_id: msg.chat.id,
          chat_title: msg.chat.title ||
            (msg.chat.type === 'private'
              ? `${(msg.chat as any).first_name || ''} ${(msg.chat as any).last_name || ''}`.trim() || (msg.chat as any).username || 'Shaxsiy chat'
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
          date: new Date(msg.date * 1000), // ✅ BUG FIX
        });

        this.logger.log('✅ Message saved');

        // Smart Memory (Knowledge Graph) extraction
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
      } catch (err: any) {
        this.logger.error(`Save message error: ${err.message}`);
        this.logsService.logTelegramError('save_message_failed', err.stack, { messageId: ctx.businessMessage?.message_id });
      }
    });

    // ==================== Deleted Business Messages ====================
    bot.on('deleted_business_messages', async (ctx) => {
      try {
        const deletedData = ctx.deletedBusinessMessages;

        for (const msgId of deletedData.message_ids) {
          const archived = await this.messagesService.markDeleted(deletedData.business_connection_id, msgId);
          if (!archived) continue;

          let owner = null;
          if (archived.owner_id) {
            owner = await this.usersService.findByChatId(archived.owner_id);
          } else {
            owner = await this.usersService.findByConnectionId(deletedData.business_connection_id);
          }

          if (!owner || owner.notify_deletes === false) continue;

          let fullName = this.escapeHTML(archived.sender_first_name);
          if (archived.sender_last_name) {
            fullName += ' ' + this.escapeHTML(archived.sender_last_name);
          }

          const usernameText = archived.sender_username
            ? ` (@${this.escapeHTML(archived.sender_username)})`
            : '';

          const caption =
            `🗑 <b>Xabar o'chirildi!</b>\n\n` +
            `👤 <b>Kimdan:</b> <a href="tg://user?id=${archived.sender_id}">${fullName}</a>${usernameText}\n` +
            `🏠 <b>Chat:</b> ${this.escapeHTML(archived.chat_title)}\n\n` +
            `💬 <b>Matn:</b>\n` +
            `<i>${this.escapeHTML(archived.text || '[Media]')}</i>\n\n` +
            `@TrackMyChatBot`;

          // Premium foydalanuvchilar uchun "Saqlash" tugmasi
          const isPremium = this.premiumService.isPremiumActive(owner);
          const keyboard = isPremium && archived.text
            ? new InlineKeyboard().text('⭐ Saqlash', `save_msg_${archived._id}`)
            : undefined;

          try {
            if (archived.media_type?.includes('Rasm')) {
              await bot.api.sendPhoto(owner.chat_id, archived.media_file_id!, {
                caption, parse_mode: 'HTML',
                ...(keyboard ? { reply_markup: keyboard } : {})
              });
            } else if (archived.media_type?.includes('Video')) {
              await bot.api.sendVideo(owner.chat_id, archived.media_file_id!, {
                caption, parse_mode: 'HTML',
                ...(keyboard ? { reply_markup: keyboard } : {})
              });
            } else if (archived.media_type?.includes('Voice')) {
              await bot.api.sendVoice(owner.chat_id, archived.media_file_id!, {
                caption, parse_mode: 'HTML',
              });
            } else if (archived.media_type?.includes('Document')) {
              await bot.api.sendDocument(owner.chat_id, archived.media_file_id!, {
                caption, parse_mode: 'HTML',
              });
            } else if (archived.media_type?.includes('Sticker')) {
              await bot.api.sendSticker(owner.chat_id, archived.media_file_id!);
              await bot.api.sendMessage(owner.chat_id, caption, {
                parse_mode: 'HTML',
                ...(keyboard ? { reply_markup: keyboard } : {})
              });
            } else if (archived.media_type?.includes('Round Video')) {
              await bot.api.sendVideoNote(owner.chat_id, archived.media_file_id!);
              await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Audio')) {
              await bot.api.sendAudio(owner.chat_id, archived.media_file_id!, {
                caption, parse_mode: 'HTML',
              });
            } else {
              await bot.api.sendMessage(owner.chat_id, caption, {
                parse_mode: 'HTML',
                ...(keyboard ? { reply_markup: keyboard } : {})
              });
            }
          } catch (err: any) {
            this.logger.error(`❌ Send deleted message notification error: ${err.message}`);
          }
        }
      } catch (err: any) {
        this.logger.error(`Delete event processing error: ${err.message}`);
      }
    });

    // ==================== Edited Business Message ====================
    bot.on('edited_business_message', async (ctx) => {
      try {
        const editedMsg = ctx.editedBusinessMessage;
        const oldMsg = await this.messagesService.findOne(editedMsg.business_connection_id, editedMsg.message_id);
        if (!oldMsg) return;

        let owner = null;
        if (oldMsg.owner_id) {
          owner = await this.usersService.findByChatId(oldMsg.owner_id);
        } else {
          owner = await this.usersService.findByConnectionId(editedMsg.business_connection_id);
        }

        if (!owner || owner.notify_edits === false) return;

        const mediaInfo = await this.extractMedia(editedMsg);

        let fullName = this.escapeHTML(editedMsg.from.first_name);
        if (editedMsg.from.last_name) {
          fullName += ' ' + this.escapeHTML(editedMsg.from.last_name);
        }

        const usernameText = editedMsg.from.username
          ? ` (@${this.escapeHTML(editedMsg.from.username)})`
          : '';

        const newText = editedMsg.text || editedMsg.caption || '';

        const report =
          `✏️ <b>Xabar tahrirlandi!</b>\n\n` +
          `👤 <b>Kimdan:</b> <a href="tg://user?id=${editedMsg.from.id}">${fullName}</a>${usernameText}\n\n` +
          `❌ <b>Eski:</b>\n` +
          `<i>${this.escapeHTML(oldMsg.text)}</i>\n\n` +
          `✅ <b>Yangi:</b>\n` +
          `<i>${this.escapeHTML(newText)}</i>\n\n` +
          `@TrackMyChatBot`;

        // Premium foydalanuvchilar uchun "Saqlash" tugmasi
        const isPremium = this.premiumService.isPremiumActive(owner);
        const keyboard = isPremium && oldMsg.text
          ? new InlineKeyboard().text('⭐ Eski versiyani saqlash', `save_msg_${oldMsg._id}`)
          : undefined;

        await bot.api.sendMessage(owner.chat_id, report, {
          parse_mode: 'HTML',
          ...(keyboard ? { reply_markup: keyboard } : {})
        });

        oldMsg.edit_history.push({ text: oldMsg.text || '', date: new Date() });
        oldMsg.text = newText;
        oldMsg.is_edited = true;
        oldMsg.media_type = mediaInfo.type || undefined;
        oldMsg.media_file_id = mediaInfo.file_id || undefined;
        oldMsg.media_file_path = mediaInfo.file_path || undefined;

        await oldMsg.save();
        this.logger.log('✏️ Message updated');
      } catch (err: any) {
        this.logger.error(`Edit event error: ${err.message}`);
        this.logsService.logTelegramError('edit_message_failed', err.stack, { messageId: ctx.editedBusinessMessage?.message_id });
      }
    });

  }

  // ==================== Helper: Saqlangan xabarlarni ko'rsatish ====================
  private async showSavedMessages(ctx: any, page: number, editMessage = false) {
    const { items, total, limit } = await this.savedMessagesService.findByOwner(ctx.from.id, page, 5);

    if (total === 0) {
      const text =
        `⭐ <b>Saqlangan Xabarlar</b>\n\n` +
        `Hozircha saqlangan xabar yo'q.\n\n` +
        `💡 <i>Xabarlar o'chirilganda yoki tahrirlanganda bildirishnomada "⭐ Saqlash" tugmasi paydo bo'ladi.</i>\n\n` +
        `@TrackMyChatBot`;
      if (editMessage) {
        await ctx.editMessageText(text, { parse_mode: 'HTML' }).catch(() => ctx.reply(text, { parse_mode: 'HTML' }));
      } else {
        await ctx.reply(text, { parse_mode: 'HTML' });
      }
      return;
    }

    const totalPages = Math.ceil(total / limit);
    let text = `⭐ <b>Saqlangan Xabarlar</b> (${total} ta)\n`;
    text += `📄 Sahifa ${page}/${totalPages}\n\n`;

    items.forEach((saved, i) => {
      const num = (page - 1) * limit + i + 1;
      const senderName = this.escapeHTML(saved.sender_first_name || 'Noma\'lum');
      const chatTitle = this.escapeHTML(saved.chat_title || 'Noma\'lum chat');
      const preview = this.escapeHTML((saved.text || '[Media]').substring(0, 80));
      const savedDate = new Date(saved.saved_at).toLocaleDateString('uz-UZ');
      text += `${num}. 👤 ${senderName} | 🏠 ${chatTitle}\n`;
      text += `   📝 <i>${preview}</i>\n`;
      text += `   📅 ${savedDate}\n\n`;
    });

    // Sahifalash va o'chirish tugmalari
    const keyboard = new InlineKeyboard();
    items.forEach((saved) => {
      keyboard.text(`🗑 #${items.indexOf(saved) + (page - 1) * limit + 1} ni o'chirish`, `del_saved_${saved._id}`).row();
    });

    if (totalPages > 1) {
      if (page > 1) keyboard.text('◀️ Oldingi', `saved_page_${page - 1}`);
      if (page < totalPages) keyboard.text('Keyingi ▶️', `saved_page_${page + 1}`);
    }

    text += `@TrackMyChatBot`;

    if (editMessage) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() =>
        ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard })
      );
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  }

  // ==================== Helper: Eslatmalarni ko'rsatish ====================
  private async showReminders(ctx: any) {
    const reminders = await this.remindersService.findActiveByOwner(ctx.from.id);

    if (reminders.length === 0) {
      await ctx.reply(
        `⏰ <b>Eslatmalar</b>\n\n` +
        `Faol eslatmalar mavjud emas.\n\n` +
        `💡 Yangi eslatma qo'shish uchun:\n` +
        `<code>/eslatma 30m Shifokorga boring</code>\n` +
        `<code>/eslatma 2s Uchrashuv bor</code>\n` +
        `<code>/eslatma 15:30 Kechki ovqat</code>\n\n` +
        `@TrackMyChatBot`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    let text = `⏰ <b>Faol Eslatmalar</b> (${reminders.length} ta)\n\n`;
    const keyboard = new InlineKeyboard();

    reminders.forEach((reminder, i) => {
      const timeStr = this.formatRemindAt(new Date(reminder.remind_at));
      text += `${i + 1}. 📝 <i>${this.escapeHTML(reminder.text)}</i>\n`;
      text += `   ⏰ ${timeStr}\n\n`;
      keyboard.text(`❌ #${i + 1} bekor qilish`, `cancel_reminder_${reminder._id}`).row();
    });

    text += `@TrackMyChatBot`;
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
  }

  /**
   * Foydalanuvchining bot saqlagan chatlarini ko'rsatish (sahifalash bilan)
   */
  private async showUserChats(ctx: any, page: number = 1, isEdit: boolean = false) {
    try {
      const ownerId = ctx.from?.id;
      if (!ownerId) return;

      const chats = await this.messagesService.getUserChats(ownerId);
      if (!chats || chats.length === 0) {
        const emptyText =
          `💬 <b>Saqlangan chatlar topilmadi</b>\n\n` +
          `Bot hali sizning Telegram accountingizdan chat xabarlarini saqlab olmagan.\n` +
          `Telegram Business orqali bot ulanganligini tekshiring yoki yangi xabarlar kelgach qayta urinib ko'ring.\n\n` +
          `@TrackMyChatBot`;
        if (isEdit) {
          await ctx.editMessageText(emptyText, { parse_mode: 'HTML' }).catch(() => {});
        } else {
          await ctx.reply(emptyText, { parse_mode: 'HTML' });
        }
        return;
      }

      const limit = 5;
      const totalPages = Math.ceil(chats.length / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      const currentChats = chats.slice((currentPage - 1) * limit, currentPage * limit);

      const keyboard = new InlineKeyboard();

      for (const c of currentChats) {
        const title = c.chat_title || (c.chat_type === 'private' ? `User ${c._id}` : `Chat ${c._id}`);
        const truncated = title.length > 32 ? title.substring(0, 30) + '...' : title;
        const icon = c.chat_type === 'private' ? '👤' : '👥';
        keyboard.text(`${icon} ${truncated}`, `dl_chat_${c._id}`).row();
      }

      if (totalPages > 1) {
        if (currentPage > 1) {
          keyboard.text('⬅️ Oldingi', `chats_page_${currentPage - 1}`);
        }
        keyboard.text(`📄 ${currentPage}/${totalPages}`, 'noop');
        if (currentPage < totalPages) {
          keyboard.text('Keyingi ➡️', `chats_page_${currentPage + 1}`);
        }
        keyboard.row();
      }

      const text =
        `📁 <b>Saqlangan Chatlar Ro'yxati</b> (Jami: ${chats.length} ta)\n\n` +
        `O'zingizga kerakli chatni tanlang. Bot o'sha odam/guruh bilan <b>so'nggi 1 haftalik to'liq yozishmalar tarixini</b> (shu jumladan o'chirilgan va tahrirlangan xabarlarni) <b>PDF hujjat</b> formatida yuklab beradi.\n\n` +
        `💡 <i>Eslatma: Agar chat Telegram ilovangizda to'liq o'chirib yuborilgan bo'lsa ham, bot saqlagan barcha xabarlar PDF faylda to'liq aks etadi.</i>\n\n` +
        `@TrackMyChatBot`;

      if (isEdit) {
        await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => {});
      } else {
        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
      }
    } catch (err: any) {
      this.logger.error(`Error showing user chats: ${err.message}`);
    }
  }

  /**
   * Tanlangan chat bo'yicha so'nggi 1 haftalik to'liq chat tarixini PDF formatda jo'natish
   */
  private async handleDownloadChatPdf(ctx: any, targetChatId: number) {
    const ownerId = ctx.from?.id;
    if (!ownerId) return;

    let statusMsg: any = null;
    try {
      statusMsg = await ctx.reply(
        `⏳ <b>Chat tarixi to'planmoqda va PDF tayyorlanmoqda...</b>\n\nIltimos, biroz kuting...`,
        { parse_mode: 'HTML' }
      );

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let messages = await this.messagesService.getChatMessagesTimeframe(ownerId, targetChatId, oneWeekAgo);
      let isFallback = false;

      // Agar so'nggi 7 kunda yangi xabar bo'lmasa, ushbu chat bo'yicha saqlangan barcha xabarlarni olamiz
      if (messages.length === 0) {
        messages = await this.messagesService.getChatMessages(ownerId, targetChatId);
        isFallback = true;
      }

      if (messages.length === 0) {
        if (statusMsg) {
          await ctx.api.editMessageText(
            ctx.chat.id,
            statusMsg.message_id,
            `❌ Ushbu chat bo'yicha saqlangan xabarlar topilmadi.\n\n@TrackMyChatBot`
          ).catch(() => {});
        }
        return;
      }

      const chats = await this.messagesService.getUserChats(ownerId);
      const foundChat = chats.find((c) => c._id === targetChatId);
      const chatTitle = foundChat?.chat_title || `Chat_${targetChatId}`;

      const pdfPath = await generateChatPdf({
        ownerId,
        chatId: targetChatId,
        chatTitle,
        messages,
        fromDate: isFallback ? undefined : oneWeekAgo,
        toDate: new Date(),
      });

      const deletedCount = messages.filter((m) => m.is_deleted).length;
      const editedCount = messages.filter((m) => m.is_edited).length;
      const periodText = isFallback ? "Mavjud barcha yozishmalar" : "So'nggi 7 kun";
      const cleanFileName = `${chatTitle.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'chat'}_1haftalik.pdf`;

      await ctx.replyWithDocument(new InputFile(pdfPath, cleanFileName), {
        caption:
          `📄 <b>${this.escapeHTML(chatTitle)} — Chat Tarixi</b>\n\n` +
          `📅 <b>Davr:</b> ${periodText}\n` +
          `💬 <b>Jami xabarlar:</b> ${messages.length} ta\n` +
          `🗑 <b>O'chirilgan xabarlar:</b> ${deletedCount} ta\n` +
          `✏️ <b>Tahrirlangan xabarlar:</b> ${editedCount} ta\n\n` +
          `✅ <i>Chat to'liq PDF formatida tayyorlandi.</i>\n\n` +
          `@TrackMyChatBot`,
        parse_mode: 'HTML',
      });

      if (statusMsg) {
        await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
      }

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    } catch (err: any) {
      this.logger.error(`Failed to generate/send chat PDF: ${err.message}`);
      if (statusMsg) {
        await ctx.api.editMessageText(
          ctx.chat.id,
          statusMsg.message_id,
          `❌ PDF tayyorlashda xatolik yuz berdi: ${err.message || 'Noma\'lum xatolik'}`
        ).catch(() => {});
      }
    }
  }
}
