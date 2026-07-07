import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService
  ) {}

  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.adminService.findByUsername(username);
    if (admin) {
      const isMatch = await bcrypt.compare(pass, admin.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = admin.toObject();
        return result;
      }
    }
    return null;
  }

  async login(username: string, pass: string) {
    const admin = await this.validateAdmin(username, pass);
    if (!admin) {
      throw new UnauthorizedException('Invalid administrator credentials');
    }
    const payload = { username: admin.username, sub: admin._id, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      }
    };
  }
}
