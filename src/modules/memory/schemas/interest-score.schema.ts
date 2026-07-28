import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InterestScore extends Document {
  @Prop({ type: Number, required: true, index: true })
  ownerId: number;

  @Prop({ type: String, required: true, index: true })
  contactId: string;

  @Prop({ type: String, required: true })
  topic: string; // e.g. Programming, AI, Crypto, Formula 1, Football

  @Prop({ type: Number, default: 1.0 })
  score: number; // confidence score that increments on repeated discussion

  @Prop({ type: Date, default: Date.now })
  lastDiscussedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const InterestScoreSchema = SchemaFactory.createForClass(InterestScore);
InterestScoreSchema.index({ ownerId: 1, contactId: 1, topic: 1 }, { unique: true });
InterestScoreSchema.index({ ownerId: 1, score: -1 });
