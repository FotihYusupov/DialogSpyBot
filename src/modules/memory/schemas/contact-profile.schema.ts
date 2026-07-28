import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactProfile extends Document {
  @Prop({ type: Number, required: true, index: true })
  ownerId: number;

  @Prop({ type: String, required: true, index: true })
  contactId: string; // e.g. "ownerId_senderId" or "senderId"

  @Prop({ type: Number })
  chatId?: number;

  @Prop({ type: Number })
  telegramId?: number;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String, default: '' })
  summary: string;

  @Prop({ type: [String], default: [] })
  facts: string[];

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  companies: string[];

  @Prop({ type: [String], default: [] })
  education: string[];

  @Prop({ type: [String], default: [] })
  phones: string[];

  @Prop({ type: [String], default: [] })
  emails: string[];

  @Prop({ type: [String], default: [] })
  links: string[];

  @Prop({ type: [String], default: [] })
  socialLinks: string[];

  @Prop({ type: [String], default: [] })
  locations: string[];

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: [String], default: [] })
  birthdays: string[];

  @Prop({ type: [String], default: [] })
  importantDates: string[];

  @Prop({ type: [String], default: [] })
  notes: string[];

  @Prop({ type: String, default: 'Uzbekistan' })
  country?: string;

  @Prop({ type: String, default: 'uz' })
  language?: string;

  @Prop({ type: Number, default: 92 })
  confidenceScore?: number; // 0 to 100%

  @Prop({ type: Date, default: Date.now })
  firstSeen: Date;

  @Prop({ type: Date, default: Date.now })
  lastSeen: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  lastUpdated: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ContactProfileSchema = SchemaFactory.createForClass(ContactProfile);
ContactProfileSchema.index({ ownerId: 1, contactId: 1 }, { unique: true });
ContactProfileSchema.index({ ownerId: 1, lastSeen: -1 });
ContactProfileSchema.index({ ownerId: 1, lastUpdated: -1 });
ContactProfileSchema.index({ country: 1 });
ContactProfileSchema.index({ language: 1 });

