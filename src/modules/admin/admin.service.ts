import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from './schemas/admin.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
  ) {}


  async findByUsername(username: string): Promise<Admin | null> {
    return this.adminModel.findOne({ username }).exec();
  }

  async createAdmin(username: string, passwordPlain: string, role = 'admin'): Promise<Admin> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    return this.adminModel.create({
      username,
      passwordHash,
      role,
    });
  }

  async changePassword(username: string, newPasswordPlain: string): Promise<Admin | null> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPasswordPlain, salt);
    return this.adminModel.findOneAndUpdate({ username }, { passwordHash }, { returnDocument: 'after' }).exec();
  }

  async removeAdmin(username: string): Promise<any> {
    return this.adminModel.deleteOne({ username }).exec();
  }
}
