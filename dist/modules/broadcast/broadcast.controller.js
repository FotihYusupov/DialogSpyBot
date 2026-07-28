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
exports.BroadcastController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const broadcast_service_1 = require("./broadcast.service");
const create_broadcast_dto_1 = require("./dto/create-broadcast.dto");
let BroadcastController = class BroadcastController {
    constructor(broadcastService) {
        this.broadcastService = broadcastService;
    }
    async createAndSend(dto) {
        const broadcast = await this.broadcastService.create(dto);
        this.broadcastService.sendBroadcast(broadcast._id.toString());
        return {
            message: 'Broadcast campaign initiated successfully',
            broadcastId: broadcast._id,
            status: 'processing',
        };
    }
    async getBroadcasts() {
        return this.broadcastService.getAll();
    }
    async getStatus(id) {
        return this.broadcastService.findOne(id);
    }
};
exports.BroadcastController = BroadcastController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_broadcast_dto_1.CreateBroadcastDto]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "createAndSend", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "getBroadcasts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "getStatus", null);
exports.BroadcastController = BroadcastController = __decorate([
    (0, common_1.Controller)('admin/broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    __metadata("design:paramtypes", [broadcast_service_1.BroadcastService])
], BroadcastController);
//# sourceMappingURL=broadcast.controller.js.map