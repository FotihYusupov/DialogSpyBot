import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedMessage } from './schemas/saved-message.schema';

@Injectable()
export class SavedMessagesService {
  private readonly logger = new Logger(SavedMessagesService.name);

  constructor(
    @InjectModel(SavedMessage.name) private savedModel: Model<SavedMessage>
  ) {}

  /**
   * Xabarni saqlash
   */
  async save(data: {
    owner_id: number;
    business_connection_id?: string;
    original_message_id?: number;
    chat_id?: number;
    chat_title?: string;
    sender_id?: number;
    sender_first_name?: string;
    sender_last_name?: string;
    sender_username?: string;
    text?: string;
    media_type?: string;
    media_file_id?: string;
    note?: string;
  }): Promise<SavedMessage> {
    return this.savedModel.create(data);
  }

  /**
   * Foydalanuvchining saqlangan xabarlarini olish (sahifalash bilan)
   */
  async findByOwner(
    ownerId: number,
    page = 1,
    limit = 5
  ): Promise<{ items: SavedMessage[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.savedModel
        .find({ owner_id: ownerId })
        .sort({ saved_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.savedModel.countDocuments({ owner_id: ownerId }).exec(),
    ]);
    return { items, total, page, limit };
  }

  /**
   * Xabar allaqachon saqlanganmi?
   */
  async isAlreadySaved(ownerId: number, originalMessageId: number): Promise<boolean> {
    const exists = await this.savedModel.findOne({
      owner_id: ownerId,
      original_message_id: originalMessageId,
    }).exec();
    return !!exists;
  }

  /**
   * ID orqali o'chirish
   */
  async deleteById(savedId: string, ownerId: number): Promise<boolean> {
    const result = await this.savedModel.deleteOne({
      _id: savedId,
      owner_id: ownerId,
    }).exec();
    return result.deletedCount > 0;
  }

  /**
   * Barcha saqlanganlarni o'chirish
   */
  async deleteAll(ownerId: number): Promise<number> {
    const result = await this.savedModel.deleteMany({ owner_id: ownerId }).exec();
    return result.deletedCount;
  }

  /**
   * Jami saqlangan xabarlar soni
   */
  async countByOwner(ownerId: number): Promise<number> {
    return this.savedModel.countDocuments({ owner_id: ownerId }).exec();
  }
}
