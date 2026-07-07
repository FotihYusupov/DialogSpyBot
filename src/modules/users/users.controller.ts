import { Controller, Get, Post, Query, Param, Res, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { BotService } from '../bot/bot.service';
import { MessagesService } from '../messages/messages.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
    private messagesService: MessagesService
  ) {}

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

  @Get('media/download')
  async getMedia(@Query('path') filePath: string, @Res() res: Response) {
    try {
      const response = await this.botService.downloadFile(filePath);
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  @Get(':chatId/chats')
  async getUserChats(@Param('chatId') chatId: string) {
    return this.messagesService.getUserChats(Number(chatId));
  }

  @Get(':chatId/chats/:targetChatId')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Param('targetChatId') targetChatId: string
  ) {
    return this.messagesService.getChatMessages(Number(chatId), Number(targetChatId));
  }

  @Post(':chatId/simulate-test')
  async simulateTest(@Param('chatId') chatId: string) {
    const userChatId = Number(chatId);
    const bot = this.botService.getBotInstance();
    
    await bot.api.sendMessage(
      userChatId,
      `🔔 <b>Test Xabarnomasi</b>\n\nTrackMyChatBot tizimidagi sozlamalaringiz to'g'ri ishlayotganini tekshirish uchun ushbu xabar yuborildi.\n\n@TrackMyChatBot`,
      { parse_mode: 'HTML' }
    );
    
    return { success: true, message: 'Test message delivered successfully' };
  }
}
