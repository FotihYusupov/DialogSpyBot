import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';

@Controller('admin/broadcast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Post()
  async createAndSend(@Body() dto: CreateBroadcastDto) {
    const broadcast = await this.broadcastService.create(dto);
    this.broadcastService.sendBroadcast((broadcast._id as any).toString());
    return {
      message: 'Broadcast campaign initiated successfully',
      broadcastId: broadcast._id,
      status: 'processing',
    };
  }

  @Get()
  async getBroadcasts() {
    return this.broadcastService.getAll();
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    return this.broadcastService.findOne(id);
  }
}
