import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  private cache = new Map<string, any>();

  constructor(@InjectModel(Setting.name) private settingModel: Model<Setting>) {}

  async onModuleInit() {
    await this.loadAllToCache();
  }

  async loadAllToCache() {
    const settings = await this.settingModel.find().exec();
    this.cache.clear();
    for (const s of settings) {
      this.cache.set(s.key, s.value);
    }
  }

  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const setting = await this.settingModel.findOne({ key }).exec();
    if (setting) {
      this.cache.set(key, setting.value);
      return setting.value as T;
    }
    return defaultValue as T;
  }

  async set(key: string, value: any): Promise<Setting> {
    const setting = await this.settingModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    ).exec();
    this.cache.set(key, value);
    return setting;
  }

  async isMaintenanceMode(): Promise<boolean> {
    return this.get<boolean>('maintenance_mode', false);
  }

  async isFeatureEnabled(flag: string): Promise<boolean> {
    const flags = await this.get<Record<string, boolean>>('feature_flags', {});
    return !!flags[flag];
  }

  async getFeatureFlags(): Promise<Record<string, boolean>> {
    return this.get<Record<string, boolean>>('feature_flags', {});
  }

  async setFeatureFlag(flag: string, enabled: boolean): Promise<any> {
    const flags = await this.get<Record<string, boolean>>('feature_flags', {});
    flags[flag] = enabled;
    return this.set('feature_flags', flags);
  }

  async getBotConfig(): Promise<any> {
    return this.get<any>('bot_config', {});
  }

  async setBotConfig(config: any): Promise<any> {
    return this.set('bot_config', config);
  }
}
