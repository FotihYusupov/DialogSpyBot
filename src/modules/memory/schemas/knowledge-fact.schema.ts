import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class KnowledgeFact extends Document {
  @Prop({ type: Number, required: true, index: true })
  ownerId: number;

  @Prop({ type: String, required: true, index: true })
  contactId: string;

  @Prop({ type: Number })
  chatId?: number;

  @Prop({ type: String, required: true, index: true })
  type: string; // phone, email, company, occupation, skill, location, education, etc.

  @Prop({ type: String, required: true })
  value: string;

  @Prop({ type: Number, default: 0.85 })
  confidence: number; // 0.0 to 1.0

  @Prop({ type: String })
  sourceMessageId?: string | number;

  @Prop({ type: String })
  sourceText?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const KnowledgeFactSchema = SchemaFactory.createForClass(KnowledgeFact);
KnowledgeFactSchema.index({ ownerId: 1, contactId: 1, type: 1, value: 1 });
KnowledgeFactSchema.index({ ownerId: 1, type: 1 });
