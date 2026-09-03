import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TimelineEvent extends Document {
  @Prop({ type: Number, required: true, index: true })
  ownerId: number;

  @Prop({ type: String, required: true, index: true })
  contactId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: 'general' })
  category: string; // career, education, relocation, personal, milestone

  @Prop({ type: Date, default: Date.now })
  eventDate: Date;

  @Prop({ type: String })
  sourceMessageId?: string | number;

  @Prop({ type: String })
  sourceText?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);
TimelineEventSchema.index({ ownerId: 1, contactId: 1, title: 1 });
TimelineEventSchema.index({ ownerId: 1, eventDate: -1 });
