import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessMessage } from './schemas/message.schema';

@Injectable()
export class MessagesService implements OnModuleInit {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(BusinessMessage.name) private msgModel: Model<BusinessMessage>
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Ensuring BusinessMessage indexes are synced in MongoDB...');
      await this.msgModel.createIndexes();
      this.logger.log('BusinessMessage indexes synced successfully.');
    } catch (err: any) {
      this.logger.error(`Error building BusinessMessage indexes: ${err.message}`);
    }
  }

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
      { returnDocument: 'after' }
    ).exec();
  }

  async search(businessConnectionId: string, query: string, limit = 10): Promise<BusinessMessage[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      const textResults = await this.msgModel.find(
        {
          business_connection_id: businessConnectionId,
          $text: { $search: cleanQuery }
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' }, date: -1 })
      .limit(limit)
      .exec();

      if (textResults && textResults.length > 0) {
        return textResults;
      }
    } catch (err) {
      // Fallback if text search expression is invalid
    }

    return this.msgModel.find({
      business_connection_id: businessConnectionId,
      $or: [
        { text: { $regex: cleanQuery, $options: 'i' } },
        { 'edit_history.text': { $regex: cleanQuery, $options: 'i' } },
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
    if (Object.keys(filter).length === 0) {
      return this.msgModel.estimatedDocumentCount().exec();
    }
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
    return this.msgModel.estimatedDocumentCount().exec();
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
      // Sort by messageCount desc, and use owner_id (_id) desc as a tie-breaker for stability
      { $sort: { messageCount: -1, _id: -1 } },
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

  async getUserChats(ownerId: number): Promise<any[]> {
    const chats = await this.msgModel.aggregate([
      { $match: { owner_id: ownerId } },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: '$chat_id',
          chat_title: { $last: '$chat_title' },
          chat_type: { $last: '$chat_type' },
          last_message: { $last: '$text' },
          last_message_media: { $last: '$media_type' },
          last_message_date: { $last: '$date' },
          sender_names: {
            $addToSet: {
              sender_id: '$sender_id',
              first_name: '$sender_first_name',
              last_name: '$sender_last_name',
              username: '$sender_username'
            }
          }
        }
      },
      { $sort: { last_message_date: -1 } }
    ]).exec();

    return chats.map(chat => {
      if (chat.chat_type === 'private' && (chat.chat_title === 'Shaxsiy chat' || !chat.chat_title)) {
        const otherParty = chat.sender_names?.find((s: any) => s.sender_id === chat._id);
        if (otherParty) {
          const fullName = `${otherParty.first_name || ''} ${otherParty.last_name || ''}`.trim();
          chat.chat_title = fullName || (otherParty.username ? `@${otherParty.username}` : `User ${chat._id}`);
        } else {
          const fallbackParty = chat.sender_names?.find((s: any) => s.sender_id !== ownerId);
          if (fallbackParty) {
            const fullName = `${fallbackParty.first_name || ''} ${fallbackParty.last_name || ''}`.trim();
            chat.chat_title = fullName || (fallbackParty.username ? `@${fallbackParty.username}` : `User ${chat._id}`);
          }
        }
      }
      delete chat.sender_names;
      return chat;
    });
  }

  async getChatMessages(ownerId: number, chatId: number): Promise<BusinessMessage[]> {
    return this.msgModel.find({
      owner_id: ownerId,
      chat_id: chatId
    })
    .sort({ date: 1 })
    .exec();
  }

  async getChatMessagesTimeframe(
    ownerId: number,
    chatId: number,
    fromDate?: Date
  ): Promise<BusinessMessage[]> {
    const filter: any = {
      owner_id: ownerId,
      chat_id: chatId,
    };
    if (fromDate) {
      filter.$or = [
        { date: { $gte: fromDate } },
        { createdAt: { $gte: fromDate } },
      ];
    }
    return this.msgModel.find(filter)
      .sort({ date: 1 })
      .exec();
  }

  async getChatMessagesPaginated(
    ownerId: number,
    chatId: number,
    page: number,
    limit: number
  ): Promise<BusinessMessage[]> {
    const skip = (page - 1) * limit;
    return this.msgModel.find({
      owner_id: ownerId,
      chat_id: chatId
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  }

  async updateFilePathByFileId(fileId: string, filePath: string): Promise<void> {
    await this.msgModel.updateMany(
      { media_file_id: fileId },
      { media_file_path: filePath }
    ).exec();
  }

  async findByMongoId(mongoId: string): Promise<BusinessMessage | null> {
    try {
      return this.msgModel.findById(mongoId).exec();
    } catch {
      return null;
    }
  }
}
