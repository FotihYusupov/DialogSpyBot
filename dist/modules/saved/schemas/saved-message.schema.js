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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedMessageSchema = exports.SavedMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SavedMessage = class SavedMessage extends mongoose_2.Document {
};
exports.SavedMessage = SavedMessage;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], SavedMessage.prototype, "owner_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "business_connection_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], SavedMessage.prototype, "original_message_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], SavedMessage.prototype, "chat_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "chat_title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], SavedMessage.prototype, "sender_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "sender_first_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "sender_last_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "sender_username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], SavedMessage.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "media_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "media_file_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], SavedMessage.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], SavedMessage.prototype, "saved_at", void 0);
exports.SavedMessage = SavedMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SavedMessage);
exports.SavedMessageSchema = mongoose_1.SchemaFactory.createForClass(SavedMessage);
exports.SavedMessageSchema.index({ owner_id: 1, saved_at: -1 });
exports.SavedMessageSchema.index({ owner_id: 1, original_message_id: 1 });
//# sourceMappingURL=saved-message.schema.js.map