"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotModule = void 0;
const common_1 = require("@nestjs/common");
const bot_service_1 = require("./bot.service");
const users_module_1 = require("../users/users.module");
const messages_module_1 = require("../messages/messages.module");
const logs_module_1 = require("../logs/logs.module");
let BotModule = class BotModule {
};
exports.BotModule = BotModule;
exports.BotModule = BotModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => users_module_1.UsersModule), messages_module_1.MessagesModule, logs_module_1.LogsModule],
        providers: [bot_service_1.BotService],
        exports: [bot_service_1.BotService]
    })
], BotModule);
//# sourceMappingURL=bot.module.js.map