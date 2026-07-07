import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessMessage } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class MessagesController {
  constructor(
    @InjectModel(BusinessMessage.name) private msgModel: Model<BusinessMessage>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Get('messages')
  async getMessages(
    @Query('type') type?: 'all' | 'deleted' | 'edited',
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    const filter: any = {};
    if (type === 'deleted') {
      filter.is_deleted = true;
    } else if (type === 'edited') {
      filter.is_edited = true;
    }
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { sender_username: { $regex: search, $options: 'i' } },
        { sender_first_name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      // Sort by createdAt desc, and use _id desc as a unique tie-breaker to prevent pagination instability
      this.msgModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(Number(limit)).exec(),
      this.msgModel.countDocuments(filter).exec()
    ]);

    return { items, total, page, limit };
  }

  @Get('connections')
  async getConnections() {
    const usersWithConn = await this.userModel.find({
      business_connection_id: { $exists: true, $ne: null }
    }).exec();

    const connections = await Promise.all(
      usersWithConn.map(async (usr) => {
        const count = await this.msgModel.countDocuments({
          business_connection_id: usr.business_connection_id
        }).exec();

        return {
          id: usr.business_connection_id,
          owner: `${usr.first_name || 'User'} (@${usr.username || 'no_username'})`,
          status: 'active',
          health: 'healthy',
          lastSync: usr.updatedAt || usr.createdAt,
          messagesLogged: count
        };
      })
    );

    return connections;
  }
}
