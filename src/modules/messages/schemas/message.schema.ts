import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EditHistory {
  @Prop({ type: String })
  text: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

const EditHistorySchema = SchemaFactory.createForClass(EditHistory);

@Schema({ timestamps: true })
export class BusinessMessage extends Document {
  @Prop({ type: Number, index: true })
  owner_id?: number;

  @Prop({ type: String })
  business_connection_id?: string;

  @Prop({ type: Number })
  message_id: number;

  @Prop({ type: Number })
  chat_id: number;

  @Prop({ type: String })
  chat_title?: string;

  @Prop({ type: String })
  chat_type?: string;

  @Prop({ type: Number })
  sender_id: number;

  @Prop({ type: String })
  sender_first_name?: string;

  @Prop({ type: String })
  sender_last_name?: string;

  @Prop({ type: String })
  sender_username?: string;

  @Prop({ type: String })
  text?: string;

  @Prop({ type: String })
  media_type?: string;

  @Prop({ type: String })
  media_file_id?: string;

  @Prop({ type: String })
  media_file_path?: string;

  @Prop({ type: Boolean, default: false })
  is_deleted: boolean;

  @Prop({ type: Boolean, default: false })
  is_edited: boolean;

  @Prop({ type: [EditHistorySchema], default: [] })
  edit_history: EditHistory[];

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

export const BusinessMessageSchema = SchemaFactory.createForClass(BusinessMessage);
BusinessMessageSchema.index({ business_connection_id: 1, message_id: 1 });
BusinessMessageSchema.index({ date: 1 });
BusinessMessageSchema.index({ owner_id: 1, chat_id: 1, date: -1 });
BusinessMessageSchema.index({ owner_id: 1, createdAt: -1 });
BusinessMessageSchema.index({ createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ is_deleted: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ is_edited: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ owner_id: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ owner_id: 1, is_deleted: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ owner_id: 1, is_edited: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ media_type: 1, createdAt: -1, _id: -1 });
BusinessMessageSchema.index({ sender_username: 1 });
BusinessMessageSchema.index({ sender_first_name: 1 });
BusinessMessageSchema.index({ chat_title: 1 });

// Composite Full-Text Index for instant search queries
BusinessMessageSchema.index(
  {
    text: 'text',
    sender_username: 'text',
    sender_first_name: 'text',
    sender_last_name: 'text',
    chat_title: 'text'
  },
  {
    name: 'BusinessMessageTextIndex',
    weights: {
      text: 10,
      sender_username: 8,
      sender_first_name: 5,
      chat_title: 3
    }
  }
);

