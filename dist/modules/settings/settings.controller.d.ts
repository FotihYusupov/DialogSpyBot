import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        maintenanceMode: boolean;
        featureFlags: Record<string, boolean>;
        botConfiguration: any;
    }>;
    toggleMaintenance(enabled: boolean): Promise<{
        success: boolean;
        maintenanceMode: boolean;
    }>;
    updateFlag(flag: string, enabled: boolean): Promise<{
        success: boolean;
        flag: string;
        enabled: boolean;
    }>;
    updateBotConfig(config: any): Promise<{
        success: boolean;
        botConfiguration: any;
    }>;
}
