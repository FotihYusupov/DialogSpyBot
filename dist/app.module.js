"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./modules/users/users.module");
const messages_module_1 = require("./modules/messages/messages.module");
const logs_module_1 = require("./modules/logs/logs.module");
const settings_module_1 = require("./modules/settings/settings.module");
const bot_module_1 = require("./modules/bot/bot.module");
const auth_module_1 = require("./modules/auth/auth.module");
const admin_module_1 = require("./modules/admin/admin.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const broadcast_module_1 = require("./modules/broadcast/broadcast.module");
const premium_module_1 = require("./modules/premium/premium.module");
const smart_memory_module_1 = require("./modules/memory/smart-memory.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            database_module_1.DatabaseModule,
            premium_module_1.PremiumModule,
            smart_memory_module_1.SmartMemoryModule,
            users_module_1.UsersModule,
            messages_module_1.MessagesModule,
            logs_module_1.LogsModule,
            settings_module_1.SettingsModule,
            bot_module_1.BotModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            broadcast_module_1.BroadcastModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map