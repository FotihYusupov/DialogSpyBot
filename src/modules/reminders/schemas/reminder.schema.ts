import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Reminder extends Document {
  @Prop({ type: Number, required: true, index: true })
  owner_id: number; // Bot foydalanuvchisining chat_id si

  @Prop({ type: String, required: true })
  text: string; // Eslatma matni

  @Prop({ type: Date, required: true, index: true })
  remind_at: Date; // Qachon yuborish

  @Prop({ type: Boolean, default: false, index: true })
  is_sent: boolean; // Yuborilganmi?

  @Prop({ type: Boolean, default: false })
  is_cancelled: boolean; // Bekor qilinganmi?

  createdAt: Date;
  updatedAt: Date;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
ReminderSchema.index({ owner_id: 1, is_sent: 1, remind_at: 1 });
ReminderSchema.index({ remind_at: 1, is_sent: 1, is_cancelled: 1 });
