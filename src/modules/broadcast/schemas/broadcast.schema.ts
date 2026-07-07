import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Broadcast extends Document {
  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: String })
  mediaType?: string; // 'image' | 'video'

  @Prop({ type: String })
  mediaUrl?: string; // File ID or HTTP URL

  @Prop({ type: Array })
  inlineButtons?: Array<{ text: string; url: string }>;

  @Prop({ type: String })
  targetFilter: string; // 'all' | 'connected' | 'active' | 'custom'

  @Prop({ type: Number, default: 0 })
  sentCount: number;

  @Prop({ type: Number, default: 0 })
  failedCount: number;

  @Prop({ type: String, default: 'pending' })
  status: string; // 'pending' | 'processing' | 'completed' | 'failed'
}

export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);
