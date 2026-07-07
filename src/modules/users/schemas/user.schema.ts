import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: Number, unique: true, required: true })
  chat_id: number;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  first_name?: string;

  @Prop({ type: String, index: true })
  business_connection_id?: string;

  @Prop({ type: [String], default: [] })
  business_connection_ids: string[];

  @Prop({ type: Boolean, default: true })
  notify_edits: boolean;

  @Prop({ type: Boolean, default: true })
  notify_deletes: boolean;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ business_connection_ids: 1 });
