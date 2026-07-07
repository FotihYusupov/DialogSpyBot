import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LogsService } from './logs.service';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get()
  async getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string
  ) {
    return this.logsService.getPaginated({ page, limit, type });
  }
}
