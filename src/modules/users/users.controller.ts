import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('username') username?: string,
    @Query('connected') connected?: string
  ) {
    const isConnected = connected === 'true' ? true : (connected === 'false' ? false : undefined);
    return this.usersService.getPaginated({
      page,
      limit,
      search,
      username,
      connected: isConnected,
    });
  }

  @Get('export')
  async exportCsv(@Query('connected') connected: string, @Res() res: Response) {
    const isConnected = connected === 'true' ? true : (connected === 'false' ? false : undefined);
    const users = await this.usersService.getAllForExport({ connected: isConnected });

    let csvContent = 'Chat ID,Username,First Name,Connected Connection ID,Notify Edits,Notify Deletes,Created At,Last Active\n';
    for (const u of users) {
      const uname = u.username ? u.username.replace(/"/g, '""') : '';
      const fname = u.first_name ? u.first_name.replace(/"/g, '""') : '';
      const connId = u.business_connection_id || '';
      const createdAtStr = u.createdAt ? u.createdAt.toISOString() : '';
      const lastActiveStr = u.lastActiveAt ? u.lastActiveAt.toISOString() : '';
      csvContent += `${u.chat_id},"${uname}","${fname}",${connId},${u.notify_edits},${u.notify_deletes},"${createdAtStr}","${lastActiveStr}"\n`;
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('users_export.csv');
    return res.send(csvContent);
  }
}
