import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ type: String, unique: true, required: true })
  username: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, default: 'admin' })
  role: string; // 'admin' | 'superadmin'
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
