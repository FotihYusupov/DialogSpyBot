"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const setting_schema_1 = require("./schemas/setting.schema");
let SettingsService = class SettingsService {
    constructor(settingModel) {
        this.settingModel = settingModel;
        this.cache = new Map();
    }
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
    async get(key, defaultValue) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const setting = await this.settingModel.findOne({ key }).exec();
        if (setting) {
            this.cache.set(key, setting.value);
            return setting.value;
        }
        return defaultValue;
    }
    async set(key, value) {
        const setting = await this.settingModel.findOneAndUpdate({ key }, { value }, { upsert: true, returnDocument: 'after' }).exec();
        this.cache.set(key, value);
        return setting;
    }
    async isMaintenanceMode() {
        return this.get('maintenance_mode', false);
    }
    async isFeatureEnabled(flag) {
        const flags = await this.get('feature_flags', {});
        return !!flags[flag];
    }
    async getFeatureFlags() {
        return this.get('feature_flags', {});
    }
    async setFeatureFlag(flag, enabled) {
        const flags = await this.get('feature_flags', {});
        flags[flag] = enabled;
        return this.set('feature_flags', flags);
    }
    async getBotConfig() {
        return this.get('bot_config', {});
    }
    async setBotConfig(config) {
        return this.set('bot_config', config);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(setting_schema_1.Setting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map