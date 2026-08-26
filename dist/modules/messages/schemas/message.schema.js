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
exports.BusinessMessageSchema = exports.BusinessMessage = exports.EditHistory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EditHistory = class EditHistory {
};
exports.EditHistory = EditHistory;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EditHistory.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], EditHistory.prototype, "date", void 0);
exports.EditHistory = EditHistory = __decorate([
    (0, mongoose_1.Schema)()
], EditHistory);
const EditHistorySchema = mongoose_1.SchemaFactory.createForClass(EditHistory);
let BusinessMessage = class BusinessMessage extends mongoose_2.Document {
};
exports.BusinessMessage = BusinessMessage;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, index: true }),
    __metadata("design:type", Number)
], BusinessMessage.prototype, "owner_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "business_connection_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BusinessMessage.prototype, "message_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BusinessMessage.prototype, "chat_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "chat_title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "chat_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BusinessMessage.prototype, "sender_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "sender_first_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "sender_last_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "sender_username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "media_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "media_file_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BusinessMessage.prototype, "media_file_path", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], BusinessMessage.prototype, "is_deleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], BusinessMessage.prototype, "is_edited", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [EditHistorySchema], default: [] }),
    __metadata("design:type", Array)
], BusinessMessage.prototype, "edit_history", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], BusinessMessage.prototype, "date", void 0);
exports.BusinessMessage = BusinessMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BusinessMessage);
exports.BusinessMessageSchema = mongoose_1.SchemaFactory.createForClass(BusinessMessage);
exports.BusinessMessageSchema.index({ business_connection_id: 1, message_id: 1 });
exports.BusinessMessageSchema.index({ date: 1 });
exports.BusinessMessageSchema.index({ owner_id: 1, chat_id: 1, date: -1 });
exports.BusinessMessageSchema.index({ owner_id: 1, createdAt: -1 });
exports.BusinessMessageSchema.index({ createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ is_deleted: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ is_edited: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ owner_id: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ owner_id: 1, is_deleted: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ owner_id: 1, is_edited: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ media_type: 1, createdAt: -1, _id: -1 });
exports.BusinessMessageSchema.index({ sender_username: 1 });
exports.BusinessMessageSchema.index({ sender_first_name: 1 });
exports.BusinessMessageSchema.index({ chat_title: 1 });
exports.BusinessMessageSchema.index({
    text: 'text',
    sender_username: 'text',
    sender_first_name: 'text',
    sender_last_name: 'text',
    chat_title: 'text'
}, {
    name: 'BusinessMessageTextIndex',
    weights: {
        text: 10,
        sender_username: 8,
        sender_first_name: 5,
        chat_title: 3
    }
});
//# sourceMappingURL=message.schema.js.map