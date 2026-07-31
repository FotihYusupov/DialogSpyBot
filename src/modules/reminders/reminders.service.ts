import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reminder } from './schemas/reminder.schema';

export interface ParsedReminder {
  remindAt: Date | null;
  text: string;
  error?: string;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<Reminder>
  ) {}

  /**
   * Eslatma matnidan vaqt va matnni ajratib olish
   * Format: /eslatma 30m Shifokorga boring
   *         /eslatma 2s Uchrashuv
   *         /eslatma 1kun Loyihani topshir
   *         /remind 30m Go to doctor
   *         /remind 15:30 Meeting
   */
  parseReminderText(input: string): ParsedReminder {
    const trimmed = input.trim();
    if (!trimmed) {
      return { remindAt: null, text: '', error: "Eslatma matni bo'sh. Masalan: /eslatma 30m Shifokorga boring" };
    }

    const parts = trimmed.split(/\s+/);
    const timeStr = parts[0];
    const text = parts.slice(1).join(' ');

    if (!text) {
      return { remindAt: null, text: '', error: "Eslatma matnini kiriting. Masalan: /eslatma 30m Shifokorga boring" };
    }

    const now = new Date();
    let remindAt: Date | null = null;

    // Vaqt oralig'i formati: 30m, 2s, 1kun, 1h, 2d, 45min, 1soat
    const intervalMatch = timeStr.match(/^(\d+)(m|min|daqiqa|s|soat|h|d|kun|day)$/i);
    if (intervalMatch) {
      const amount = parseInt(intervalMatch[1], 10);
      const unit = intervalMatch[2].toLowerCase();
      const ms = now.getTime();

      if (['m', 'min', 'daqiqa'].includes(unit)) {
        remindAt = new Date(ms + amount * 60 * 1000);
      } else if (['s', 'soat', 'h'].includes(unit)) {
        remindAt = new Date(ms + amount * 60 * 60 * 1000);
      } else if (['d', 'kun', 'day'].includes(unit)) {
        remindAt = new Date(ms + amount * 24 * 60 * 60 * 1000);
      }
    }

    // Aniq vaqt formati: 15:30 yoki 15:30:00
    if (!remindAt) {
      const timeOfDayMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeOfDayMatch) {
        const hours = parseInt(timeOfDayMatch[1], 10);
        const minutes = parseInt(timeOfDayMatch[2], 10);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const target = new Date(now);
          target.setHours(hours, minutes, 0, 0);
          // Agar o'tib ketgan bo'lsa, ertangi kunga o'tkazamiz
          if (target <= now) {
            target.setDate(target.getDate() + 1);
          }
          remindAt = target;
        }
      }
    }

    if (!remindAt) {
      return {
        remindAt: null,
        text,
        error:
          "Vaqt formati noto'g'ri.\n\n" +
          "📌 To'g'ri formatlar:\n" +
          "• /eslatma 30m Shifokorga boring\n" +
          "• /eslatma 2s Uchrashuv\n" +
          "• /eslatma 1kun Loyihani topshir\n" +
          "• /eslatma 15:30 Kechki ovqat",
      };
    }

    return { remindAt, text };
  }

  /**
   * Yangi eslatma yaratish
   */
  async create(ownerId: number, text: string, remindAt: Date): Promise<Reminder> {
    return this.reminderModel.create({
      owner_id: ownerId,
      text,
      remind_at: remindAt,
      is_sent: false,
      is_cancelled: false,
    });
  }

  /**
   * Foydalanuvchining faol eslatmalarini olish
   */
  async findActiveByOwner(ownerId: number): Promise<Reminder[]> {
    return this.reminderModel
      .find({
        owner_id: ownerId,
        is_sent: false,
        is_cancelled: false,
        remind_at: { $gte: new Date() },
      })
      .sort({ remind_at: 1 })
      .exec();
  }

  /**
   * Yuborish vaqti kelgan eslatmalarni olish (cron uchun)
   */
  async findDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    // Keyingi 60 soniya ichida yuborish vaqti kelgan eslatmalar
    const soon = new Date(now.getTime() + 60 * 1000);
    return this.reminderModel
      .find({
        is_sent: false,
        is_cancelled: false,
        remind_at: { $lte: soon },
      })
      .exec();
  }

  /**
   * Eslatmani yuborilgan deb belgilash
   */
  async markSent(reminderId: string): Promise<void> {
    await this.reminderModel.findByIdAndUpdate(reminderId, { is_sent: true }).exec();
  }

  /**
   * Eslatmani bekor qilish
   */
  async cancel(reminderId: string, ownerId: number): Promise<boolean> {
    const result = await this.reminderModel.findOneAndUpdate(
      { _id: reminderId, owner_id: ownerId, is_sent: false },
      { is_cancelled: true }
    ).exec();
    return !!result;
  }

  /**
   * Soni
   */
  async countActiveByOwner(ownerId: number): Promise<number> {
    return this.reminderModel.countDocuments({
      owner_id: ownerId,
      is_sent: false,
      is_cancelled: false,
      remind_at: { $gte: new Date() },
    }).exec();
  }
}
