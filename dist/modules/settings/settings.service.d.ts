import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Setting } from './schemas/setting.schema';
export declare class SettingsService implements OnModuleInit {
    private settingModel;
    private cache;
    constructor(settingModel: Model<Setting>);
    onModuleInit(): Promise<void>;
    loadAllToCache(): Promise<void>;
    get<T = any>(key: string, defaultValue?: T): Promise<T>;
    set(key: string, value: any): Promise<Setting>;
    isMaintenanceMode(): Promise<boolean>;
    isFeatureEnabled(flag: string): Promise<boolean>;
    getFeatureFlags(): Promise<Record<string, boolean>>;
    setFeatureFlag(flag: string, enabled: boolean): Promise<any>;
    getBotConfig(): Promise<any>;
    setBotConfig(config: any): Promise<any>;
}
