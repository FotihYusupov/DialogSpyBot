import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByChatId(chatId: number): Promise<User | null> {
    return this.userModel.findOne({ chat_id: chatId }).exec();
  }

  async findByConnectionId(connectionId: string): Promise<User | null> {
    return this.userModel.findOne({
      $or: [
        { business_connection_id: connectionId },
        { business_connection_ids: connectionId }
      ]
    }).exec();
  }

  async createOrUpdate(chatId: number, update: Partial<User>): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { chat_id: chatId },
      { ...update, lastActiveAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    ).exec();
  }

  async disconnectBusiness(connectionId: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { business_connection_id: connectionId },
      { $unset: { business_connection_id: '' } },
      { returnDocument: 'after' }
    ).exec();
  }

  async toggleNotification(chatId: number, type: 'deletes' | 'edits'): Promise<User | null> {
    const user = await this.findByChatId(chatId);
    if (!user) return null;
    if (type === 'deletes') {
      user.notify_deletes = user.notify_deletes === false;
    } else {
      user.notify_edits = user.notify_edits === false;
    }
    return user.save();
  }

  async countTotal(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async countConnected(): Promise<number> {
    return this.userModel.countDocuments({ business_connection_id: { $exists: true, $ne: null } }).exec();
  }

  async countActiveSince(date: Date): Promise<number> {
    return this.userModel.countDocuments({ lastActiveAt: { $gte: date } }).exec();
  }

  async getPaginated(query: {
    page?: number;
    limit?: number;
    search?: string;
    username?: string;
    connected?: boolean;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { username: { $regex: query.search, $options: 'i' } },
        { first_name: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.username) {
      filter.username = { $regex: query.username, $options: 'i' };
    }
    if (query.connected !== undefined) {
      if (query.connected) {
        filter.business_connection_id = { $exists: true, $ne: null };
      } else {
        filter.business_connection_id = { $exists: false };
      }
    }

    const [items, total] = await Promise.all([
      // Sort by createdAt desc, and use _id desc as a unique tie-breaker to prevent pagination instability
      this.userModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async getAllForExport(query: any): Promise<User[]> {
    const filter: any = {};
    if (query.connected !== undefined) {
      if (query.connected) {
        filter.business_connection_id = { $exists: true, $ne: null };
      } else {
        filter.business_connection_id = { $exists: false };
      }
    }
    return this.userModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getGrowthStats(days: number): Promise<any[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.userModel.aggregate([
      { $match: { createdAt: { $gte: date } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }

  async getConnectionsOverTime(days: number): Promise<any[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.userModel.aggregate([
      { 
        $match: { 
          business_connection_id: { $exists: true, $ne: null },
          updatedAt: { $gte: date } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
