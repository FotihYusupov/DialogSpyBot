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
var SavedMessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedMessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const saved_message_schema_1 = require("./schemas/saved-message.schema");
let SavedMessagesService = SavedMessagesService_1 = class SavedMessagesService {
    constructor(savedModel) {
        this.savedModel = savedModel;
        this.logger = new common_1.Logger(SavedMessagesService_1.name);
    }
    async save(data) {
        return this.savedModel.create(data);
    }
    async findByOwner(ownerId, page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.savedModel
                .find({ owner_id: ownerId })
                .sort({ saved_at: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.savedModel.countDocuments({ owner_id: ownerId }).exec(),
        ]);
        return { items, total, page, limit };
    }
    async isAlreadySaved(ownerId, originalMessageId) {
        const exists = await this.savedModel.findOne({
            owner_id: ownerId,
            original_message_id: originalMessageId,
        }).exec();
        return !!exists;
    }
    async deleteById(savedId, ownerId) {
        const result = await this.savedModel.deleteOne({
            _id: savedId,
            owner_id: ownerId,
        }).exec();
        return result.deletedCount > 0;
    }
    async deleteAll(ownerId) {
        const result = await this.savedModel.deleteMany({ owner_id: ownerId }).exec();
        return result.deletedCount;
    }
    async countByOwner(ownerId) {
        return this.savedModel.countDocuments({ owner_id: ownerId }).exec();
    }
};
exports.SavedMessagesService = SavedMessagesService;
exports.SavedMessagesService = SavedMessagesService = SavedMessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(saved_message_schema_1.SavedMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SavedMessagesService);
//# sourceMappingURL=saved-messages.service.js.map