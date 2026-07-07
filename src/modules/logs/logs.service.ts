import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog } from './schemas/log.schema';

@Injectable()
export class LogsService {
  constructor(@InjectModel(SystemLog.name) private logModel: Model<SystemLog>) {}

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

  async getPaginated(query: { page?: number; limit?: number; type?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.type) {
      filter.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.logModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }
}
