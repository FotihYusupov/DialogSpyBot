import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog } from './schemas/log.schema';
import { ActivityLog } from './schemas/activity-log.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(SystemLog.name) private logModel: Model<SystemLog>,
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>
  ) {}

  async logTelegramError(message: string, stack?: string, meta?: any): Promise<SystemLog> {
    return this.logModel.create({ type: 'telegram_error', message, stack, meta });
  }

  async logApiError(message: string, stack?: string, meta?: any): Promise<SystemLog> {
    return this.logModel.create({ type: 'api_error', message, stack, meta });
  }

  async logException(message: string, stack?: string, meta?: any): Promise<SystemLog> {
    return this.logModel.create({ type: 'exception', message, stack, meta });
  }

  async logFailedBroadcast(message: string, meta?: any): Promise<SystemLog> {
    return this.logModel.create({ type: 'failed_broadcast', message, meta });
  }

  async logActivity(
    action: 'bot_start' | 'business_connected' | 'business_disconnected',
    chat_id: number,
    userInfo: { username?: string; first_name?: string },
    meta?: any
  ): Promise<ActivityLog> {
    return this.activityLogModel.create({
      action,
      chat_id,
      username: userInfo.username,
      first_name: userInfo.first_name,
      meta,
    });
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getPaginated(query: { page?: number; limit?: number; type?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.type) {
      filter.type = query.type;
    }

    const [items, total] = await Promise.all([
      // Sort by createdAt desc, and use _id desc as a unique tie-breaker to prevent pagination instability
      this.logModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async getActivityPaginated(query: {
    page?: number;
    limit?: number;
    action?: string;
    search?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.action && query.action !== 'all') {
      filter.action = query.action;
    }
    if (query.search) {
      const isNumber = !isNaN(Number(query.search));
      if (isNumber) {
        filter.$or = [
          { chat_id: Number(query.search) },
          { username: { $regex: query.search, $options: 'i' } },
          { first_name: { $regex: query.search, $options: 'i' } },
        ];
      } else {
        filter.$or = [
          { username: { $regex: query.search, $options: 'i' } },
          { first_name: { $regex: query.search, $options: 'i' } },
        ];
      }
    }

    const [items, total] = await Promise.all([
      this.activityLogModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityLogModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }
}
