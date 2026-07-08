import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ type: String, required: true })
  action: 'bot_start' | 'business_connected' | 'business_disconnected';

  @Prop({ type: Number, required: true })
  chat_id: number;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  first_name?: string;

  @Prop({ type: Object })
  meta?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ chat_id: 1 });
ActivityLogSchema.index({ createdAt: -1 });
