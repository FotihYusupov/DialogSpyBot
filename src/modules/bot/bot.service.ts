import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { LogsService } from '../logs/logs.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BotService implements OnApplicationBootstrap, OnApplicationShutdown {
  private bot: Bot;
  private readonly logger = new Logger(BotService.name);
  private imagePath = path.resolve(process.cwd(), 'assets', 'instructions.png');

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private messagesService: MessagesService,
    private logsService: LogsService
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

  async downloadFile(filePath: string) {
    const token = this.configService.get<string>('BOT_TOKEN');
    const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return response;
  }

  async onApplicationBootstrap() {
    this.logger.log('🤖 Initializing Telegram bot handlers...');
    this.registerHandlers();
    
    // Non-blocking start
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

  private escapeHTML(str?: string): string {
    if (!str) return '';
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

  private registerHandlers() {
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

        if (isFirstTime) {
          const caption =
            `👋 TrackMyChatBot'ga xush kelibsiz\n\n` +
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
              await ctx.replyWithPhoto(new InputFile(this.imagePath), { caption });
            } else {
              await ctx.reply(caption);
            }
          } catch (err: any) {
            this.logger.error(`❌ Rasm yuborishda xato: ${err.message}`);
            await ctx.reply(caption);
          }
        } else if (updatedUser.business_connection_id) {
          await ctx.reply('✅ Telegram accountingiz allaqachon ulangan.\n\n@TrackMyChatBot');
        } else {
          await ctx.reply(
            `👋 Bot ishlayapti.\n\nTelegram Business orqali ulang.\nBuyruqlarni ko'rish uchun /help ni bosing.\n\n@TrackMyChatBot`
          );
        }
      } catch (err: any) {
        this.logger.error(`Start command error: ${err.message}`);
        this.logsService.logTelegramError('start_command_failed', err.stack, { userId: ctx.from?.id });
      }
    });

    bot.command('help', async (ctx) => {
      try {
        const text =
          `📖 <b>Yordam</b>\n\n` +
          `/start - Botni ishga tushirish\n` +
          `/stats - Statistika\n` +
          `/settings - Sozlamalar (Xabarnomalarni o'chirish/yoqish)\n` +
          `/search &lt;so'z&gt; - Xabarlarni izlash\n` +
          `/export - Ma'lumotlarni yuklab olish\n` +
          `/help - Shu xabarni ko'rsatish\n\n` +
          `@TrackMyChatBot`;
        await ctx.reply(text, { parse_mode: 'HTML' });
      } catch (err: any) {
        this.logger.error(`Help command error: ${err.message}`);
      }
    });

    bot.command('settings', async (ctx) => {
      try {
        const user = await this.usersService.findByChatId(ctx.from.id);
        if (!user) return ctx.reply("❌ Avval /start tugmasini bosing.");

        const keyboard = new InlineKeyboard()
          .text(user.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
          .text(user.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');

        await ctx.reply('⚙️ <b>Sozlamalar</b>\nQaysi xabarnomalarni olmoqchisiz?\n\n@TrackMyChatBot', {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (err: any) {
        this.logger.error(`Settings command error: ${err.message}`);
      }
    });

    bot.on('callback_query:data', async (ctx) => {
      try {
        const data = ctx.callbackQuery.data;
        const user = await this.usersService.findByChatId(ctx.from.id);
        if (!user) return ctx.answerCallbackQuery('Foydalanuvchi topilmadi.');

        if (data === 'toggle_deletes') {
          await this.usersService.toggleNotification(user.chat_id, 'deletes');
        } else if (data === 'toggle_edits') {
          await this.usersService.toggleNotification(user.chat_id, 'edits');
        }

        const updated = await this.usersService.findByChatId(user.chat_id);
        if (!updated) return;

        const keyboard = new InlineKeyboard()
          .text(updated.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", 'toggle_deletes').row()
          .text(updated.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", 'toggle_edits');

        await ctx.editMessageReplyMarkup({ reply_markup: keyboard }).catch(() => {});
        await ctx.answerCallbackQuery('Sozlamalar saqlandi.');
      } catch (err: any) {
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
      } catch (err: any) {
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

        await ctx.replyWithDocument(new InputFile(filePath), { caption: "📂 O'chirilgan va tahrirlangan xabarlar" });
        fs.unlinkSync(filePath);
      } catch (err: any) {
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

        const text =
          `📊 <b>Statistika</b>\n\n` +
          `📥 Jami: <b>${total}</b>\n` +
          `🗑 Deleted: <b>${deleted}</b>\n` +
          `✏️ Edited: <b>${edited}</b>\n\n` +
          `@TrackMyChatBot`;

        await ctx.reply(text, { parse_mode: 'HTML' });
      } catch (err: any) {
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
        } else {
          await this.usersService.disconnectBusiness(conn.id);
          this.logger.log(`❌ Business disconnected: ${conn.id}`);
        }
      } catch (err: any) {
        this.logger.error(`Business connection error: ${err.message}`);
        this.logsService.logTelegramError('business_connection_update_failed', err.stack, { connection: ctx.businessConnection });
      }
    });

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
        });

        this.logger.log('✅ Message saved');
      } catch (err: any) {
        this.logger.error(`Save message error: ${err.message}`);
        this.logsService.logTelegramError('save_message_failed', err.stack, { messageId: ctx.businessMessage?.message_id });
      }
    });

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

          try {
            if (archived.media_type?.includes('Rasm')) {
              await bot.api.sendPhoto(owner.chat_id, archived.media_file_id!, { caption, parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Video')) {
              await bot.api.sendVideo(owner.chat_id, archived.media_file_id!, { caption, parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Voice')) {
              await bot.api.sendVoice(owner.chat_id, archived.media_file_id!, { caption, parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Document')) {
              await bot.api.sendDocument(owner.chat_id, archived.media_file_id!, { caption, parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Sticker')) {
              await bot.api.sendSticker(owner.chat_id, archived.media_file_id!);
              await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Round Video')) {
              await bot.api.sendVideoNote(owner.chat_id, archived.media_file_id!);
              await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
            } else if (archived.media_type?.includes('Audio')) {
              await bot.api.sendAudio(owner.chat_id, archived.media_file_id!, { caption, parse_mode: 'HTML' });
            } else {
              await bot.api.sendMessage(owner.chat_id, caption, { parse_mode: 'HTML' });
            }
          } catch (err: any) {
            this.logger.error(`❌ Send deleted message notification error: ${err.message}`);
          }
        }
      } catch (err: any) {
        this.logger.error(`Delete event processing error: ${err.message}`);
      }
    });

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

        await bot.api.sendMessage(owner.chat_id, report, { parse_mode: 'HTML' });

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
}
