import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SystemLog extends Document {
  @Prop({ type: String, required: true })
  type: string; // 'telegram_error' | 'api_error' | 'exception' | 'failed_broadcast'

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  stack?: string;

  @Prop({ type: Object })
  meta?: Record<string, any>;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
SystemLogSchema.index({ type: 1 });
SystemLogSchema.index({ createdAt: -1 });
