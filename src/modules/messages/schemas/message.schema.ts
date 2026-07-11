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
BusinessMessageSchema.index({ text: 'text' }); // Text index for full text search if needed
BusinessMessageSchema.index({ owner_id: 1, chat_id: 1, date: -1 });
BusinessMessageSchema.index({ owner_id: 1, createdAt: -1 });
