import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Broadcast } from './schemas/broadcast.schema';
import { UsersService } from '../users/users.service';
import { BotService } from '../bot/bot.service';
import { InlineKeyboard } from 'grammy';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    @InjectModel(Broadcast.name) private broadcastModel: Model<Broadcast>,
    private usersService: UsersService,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
    private logsService: LogsService
  ) {}

  async create(data: Partial<Broadcast>): Promise<Broadcast> {
    return this.broadcastModel.create(data);
  }

  async findOne(id: string): Promise<Broadcast | null> {
    return this.broadcastModel.findById(id).exec();
  }

  async getAll(): Promise<Broadcast[]> {
    return this.broadcastModel.find().sort({ createdAt: -1 }).exec();
  }

  async sendBroadcast(broadcastId: string): Promise<void> {
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

  private async runBroadcastProcess(broadcast: Broadcast) {
    const users = await this.usersService.findAllUsers();
    let targets = users;

    const day = 24 * 60 * 60 * 1000;
    if (broadcast.targetFilter === 'connected') {
      targets = users.filter((u) => !!u.business_connection_id);
    } else if (broadcast.targetFilter === 'active') {
      const activeThreshold = new Date(Date.now() - 7 * day);
      targets = users.filter((u) => u.lastActiveAt >= activeThreshold);
    }

    const bot = this.botService.getBotInstance();
    let sent = 0;
    let failed = 0;

    let keyboard: InlineKeyboard | undefined = undefined;
    if (broadcast.inlineButtons && broadcast.inlineButtons.length > 0) {
      keyboard = new InlineKeyboard();
      broadcast.inlineButtons.forEach((btn, idx) => {
        if (idx > 0 && idx % 2 === 0) keyboard.row();
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
        } else if (broadcast.mediaType === 'video' && broadcast.mediaUrl) {
          await bot.api.sendVideo(user.chat_id, broadcast.mediaUrl, {
            caption: broadcast.text,
            reply_markup: keyboard,
          });
        } else {
          await bot.api.sendMessage(user.chat_id, broadcast.text, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
          });
        }
        sent++;
      } catch (err: any) {
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
}
