import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessMessage } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(BusinessMessage.name) private msgModel: Model<BusinessMessage>
  ) {}

  async create(data: Partial<BusinessMessage>): Promise<BusinessMessage> {
    return this.msgModel.create(data);
  }

  async findOne(businessConnectionId: string, messageId: number): Promise<BusinessMessage | null> {
    return this.msgModel.findOne({
      business_connection_id: businessConnectionId,
      message_id: messageId,
    }).exec();
  }

  async markDeleted(businessConnectionId: string, messageId: number): Promise<BusinessMessage | null> {
    return this.msgModel.findOneAndUpdate(
      {
        business_connection_id: businessConnectionId,
        message_id: messageId,
      },
      { is_deleted: true },
      { new: true }
    ).exec();
  }

  async search(businessConnectionId: string, query: string, limit = 10): Promise<BusinessMessage[]> {
    return this.msgModel.find({
      business_connection_id: businessConnectionId,
      $or: [
        { text: { $regex: query, $options: 'i' } },
        { 'edit_history.text': { $regex: query, $options: 'i' } },
      ],
    })
    .limit(limit)
    .exec();
  }

  async getDeletedAndEditedForExport(businessConnectionId: string): Promise<BusinessMessage[]> {
    return this.msgModel.find({
      business_connection_id: businessConnectionId,
      $or: [{ is_deleted: true }, { is_edited: true }],
    })
    .lean()
    .exec() as any;
  }

  async countTotal(ownerId?: number, connectionIds: string[] = [], primaryConnectionId?: string): Promise<number> {
    const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
    return this.msgModel.countDocuments(filter).exec();
  }

  async countDeleted(ownerId?: number, connectionIds: string[] = [], primaryConnectionId?: string): Promise<number> {
    const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
    filter.is_deleted = true;
    return this.msgModel.countDocuments(filter).exec();
  }

  async countEdited(ownerId?: number, connectionIds: string[] = [], primaryConnectionId?: string): Promise<number> {
    const filter = this.buildUserMessagesFilter(ownerId, connectionIds, primaryConnectionId);
    filter.is_edited = true;
    return this.msgModel.countDocuments(filter).exec();
  }

  private buildUserMessagesFilter(ownerId?: number, connectionIds: string[] = [], primaryConnectionId?: string): any {
    const conditions: any[] = [];
    if (primaryConnectionId) {
      conditions.push({ business_connection_id: primaryConnectionId });
    }
    if (connectionIds && connectionIds.length > 0) {
      conditions.push({ business_connection_id: { $in: connectionIds } });
    }
    if (ownerId) {
      conditions.push({ owner_id: ownerId });
    }
    if (conditions.length === 0) {
      return {};
    }
    return { $or: conditions };
  }

  // Dashboard calculations
  async countAllMessages(): Promise<number> {
    return this.msgModel.countDocuments().exec();
  }

  async countAllDeleted(): Promise<number> {
    return this.msgModel.countDocuments({ is_deleted: true }).exec();
  }

  async countAllEdited(): Promise<number> {
    return this.msgModel.countDocuments({ is_edited: true }).exec();
  }

  async countMessagesToday(): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return this.msgModel.countDocuments({ createdAt: { $gte: startOfToday } }).exec();
  }

  async getAverageActivityPerUser(): Promise<number> {
    const result = await this.msgModel.aggregate([
      {
        $group: {
          _id: '$owner_id',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$count' }
        }
      }
    ]).exec();
    return result[0]?.avg || 0;
  }

  async getTopActiveUsers(limit = 10): Promise<any[]> {
    return this.msgModel.aggregate([
      {
        $group: {
          _id: '$owner_id',
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'chat_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          _id: 1,
          messageCount: 1,
          username: { $arrayElemAt: ['$userInfo.username', 0] }
        }
      }
    ]).exec();
  }

  async getPeakHours(days = 7): Promise<any[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.msgModel.aggregate([
      { $match: { createdAt: { $gte: date } } },
      {
        $project: {
          hour: { $hour: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }
}
