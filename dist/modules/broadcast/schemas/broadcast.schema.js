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
exports.BroadcastSchema = exports.Broadcast = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Broadcast = class Broadcast extends mongoose_2.Document {
};
exports.Broadcast = Broadcast;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Broadcast.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Broadcast.prototype, "mediaType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Broadcast.prototype, "mediaUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array }),
    __metadata("design:type", Array)
], Broadcast.prototype, "inlineButtons", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Broadcast.prototype, "targetFilter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Broadcast.prototype, "sentCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Broadcast.prototype, "failedCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'pending' }),
    __metadata("design:type", String)
], Broadcast.prototype, "status", void 0);
exports.Broadcast = Broadcast = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Broadcast);
exports.BroadcastSchema = mongoose_1.SchemaFactory.createForClass(Broadcast);
//# sourceMappingURL=broadcast.schema.js.map