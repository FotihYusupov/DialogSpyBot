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
exports.KnowledgeFactSchema = exports.KnowledgeFact = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let KnowledgeFact = class KnowledgeFact extends mongoose_2.Document {
};
exports.KnowledgeFact = KnowledgeFact;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], KnowledgeFact.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], KnowledgeFact.prototype, "contactId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], KnowledgeFact.prototype, "chatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], KnowledgeFact.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], KnowledgeFact.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0.85 }),
    __metadata("design:type", Number)
], KnowledgeFact.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], KnowledgeFact.prototype, "sourceMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], KnowledgeFact.prototype, "sourceText", void 0);
exports.KnowledgeFact = KnowledgeFact = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], KnowledgeFact);
exports.KnowledgeFactSchema = mongoose_1.SchemaFactory.createForClass(KnowledgeFact);
exports.KnowledgeFactSchema.index({ ownerId: 1, contactId: 1, type: 1, value: 1 });
exports.KnowledgeFactSchema.index({ ownerId: 1, type: 1 });
//# sourceMappingURL=knowledge-fact.schema.js.map