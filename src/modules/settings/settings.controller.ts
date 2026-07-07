import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    const maintenance = await this.settingsService.isMaintenanceMode();
    const flags = await this.settingsService.getFeatureFlags();
    const botConfig = await this.settingsService.getBotConfig();
    return {
      maintenanceMode: maintenance,
      featureFlags: flags,
      botConfiguration: botConfig,
    };
  }

  @Post('maintenance')
  async toggleMaintenance(@Body('enabled') enabled: boolean) {
    await this.settingsService.set('maintenance_mode', enabled);
    return { success: true, maintenanceMode: enabled };
  }

  @Post('flags')
  async updateFlag(@Body('flag') flag: string, @Body('enabled') enabled: boolean) {
    await this.settingsService.setFeatureFlag(flag, enabled);
    return { success: true, flag, enabled };
  }

  @Post('bot-config')
  async updateBotConfig(@Body() config: any) {
    await this.settingsService.setBotConfig(config);
    return { success: true, botConfiguration: config };
  }
}
