import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SavedMessage extends Document {
  @Prop({ type: Number, required: true, index: true })
  owner_id: number; // Bot foydalanuvchisining chat_id si

  @Prop({ type: String })
  business_connection_id?: string;

  @Prop({ type: Number })
  original_message_id?: number;

  @Prop({ type: Number })
  chat_id?: number;

  @Prop({ type: String })
  chat_title?: string;

  @Prop({ type: Number })
  sender_id?: number;

  @Prop({ type: String })
  sender_first_name?: string;

  @Prop({ type: String })
  sender_last_name?: string;

  @Prop({ type: String })
  sender_username?: string;

  @Prop({ type: String, default: '' })
  text: string;

  @Prop({ type: String })
  media_type?: string;

  @Prop({ type: String })
  media_file_id?: string;

  @Prop({ type: String })
  note?: string; // Foydalanuvchi izoh qoldirishi mumkin

  @Prop({ type: Date, default: Date.now })
  saved_at: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const SavedMessageSchema = SchemaFactory.createForClass(SavedMessage);
SavedMessageSchema.index({ owner_id: 1, saved_at: -1 });
SavedMessageSchema.index({ owner_id: 1, original_message_id: 1 });
