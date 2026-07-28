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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
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
    async toggleMaintenance(enabled) {
        await this.settingsService.set('maintenance_mode', enabled);
        return { success: true, maintenanceMode: enabled };
    }
    async updateFlag(flag, enabled) {
        await this.settingsService.setFeatureFlag(flag, enabled);
        return { success: true, flag, enabled };
    }
    async updateBotConfig(config) {
        await this.settingsService.setBotConfig(config);
        return { success: true, botConfiguration: config };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    __param(0, (0, common_1.Body)('enabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "toggleMaintenance", null);
__decorate([
    (0, common_1.Post)('flags'),
    __param(0, (0, common_1.Body)('flag')),
    __param(1, (0, common_1.Body)('enabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateFlag", null);
__decorate([
    (0, common_1.Post)('bot-config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateBotConfig", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('admin/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map