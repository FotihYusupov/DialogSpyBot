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
exports.MemoryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const smart_memory_service_1 = require("./smart-memory.service");
let MemoryController = class MemoryController {
    constructor(memoryService) {
        this.memoryService = memoryService;
    }
    async getMemoryStats(ownerId) {
        const numericOwnerId = ownerId ? Number(ownerId) : undefined;
        return this.memoryService.getMemoryStats(numericOwnerId);
    }
    async getContacts(page, limit, search, sortBy, sortOrder, ownerId, premiumOnly, updatedToday, updatedThisWeek, hasFacts, hasInterests, hasTimeline, language, country) {
        return this.memoryService.getPaginatedContacts({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
            sortBy,
            sortOrder,
            ownerId: ownerId ? Number(ownerId) : undefined,
            premiumOnly: premiumOnly === 'true',
            updatedToday: updatedToday === 'true',
            updatedThisWeek: updatedThisWeek === 'true',
            hasFacts: hasFacts === 'true',
            hasInterests: hasInterests === 'true',
            hasTimeline: hasTimeline === 'true',
            language,
            country,
        });
    }
    async getProfiles(ownerId, page, limit, search) {
        return this.memoryService.getPaginatedContacts({
            ownerId: ownerId ? Number(ownerId) : undefined,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
        });
    }
    async getContactGraph(contactId, ownerId) {
        const numericOwnerId = ownerId ? Number(ownerId) : 0;
        return this.memoryService.getContactMemoryGraph(numericOwnerId, contactId);
    }
    async deleteFact(factId) {
        return this.memoryService.deleteFact(factId);
    }
    async deleteContactMemory(contactId, ownerId) {
        const numericOwnerId = ownerId ? Number(ownerId) : 0;
        return this.memoryService.deleteContactMemory(numericOwnerId, contactId);
    }
    async refreshSummary(contactId, ownerId) {
        const numericOwnerId = ownerId ? Number(ownerId) : 0;
        return this.memoryService.refreshSummary(contactId, numericOwnerId);
    }
    async mergeDuplicates(contactId, ownerId) {
        const numericOwnerId = ownerId ? Number(ownerId) : 0;
        return this.memoryService.mergeDuplicates(contactId, numericOwnerId);
    }
    async queryKnowledgeGraph(ownerId, queryText) {
        return this.memoryService.queryKnowledgeGraph(Number(ownerId), queryText);
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryStats", null);
__decorate([
    (0, common_1.Get)('contacts'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Query)('ownerId')),
    __param(6, (0, common_1.Query)('premiumOnly')),
    __param(7, (0, common_1.Query)('updatedToday')),
    __param(8, (0, common_1.Query)('updatedThisWeek')),
    __param(9, (0, common_1.Query)('hasFacts')),
    __param(10, (0, common_1.Query)('hasInterests')),
    __param(11, (0, common_1.Query)('hasTimeline')),
    __param(12, (0, common_1.Query)('language')),
    __param(13, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)('profiles'),
    __param(0, (0, common_1.Query)('ownerId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getProfiles", null);
__decorate([
    (0, common_1.Get)('profiles/:contactId'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getContactGraph", null);
__decorate([
    (0, common_1.Delete)('facts/:factId'),
    __param(0, (0, common_1.Param)('factId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteFact", null);
__decorate([
    (0, common_1.Delete)('profiles/:contactId'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteContactMemory", null);
__decorate([
    (0, common_1.Post)('profiles/:contactId/refresh-summary'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "refreshSummary", null);
__decorate([
    (0, common_1.Post)('profiles/:contactId/merge-duplicates'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "mergeDuplicates", null);
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)('ownerId')),
    __param(1, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "queryKnowledgeGraph", null);
exports.MemoryController = MemoryController = __decorate([
    (0, common_1.Controller)('admin/memory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    __metadata("design:paramtypes", [smart_memory_service_1.SmartMemoryService])
], MemoryController);
//# sourceMappingURL=memory.controller.js.map