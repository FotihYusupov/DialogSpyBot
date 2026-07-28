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
exports.ActivityLogSchema = exports.ActivityLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ActivityLog = class ActivityLog extends mongoose_2.Document {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "chat_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ActivityLog.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ActivityLog.prototype, "first_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "meta", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ActivityLog);
exports.ActivityLogSchema = mongoose_1.SchemaFactory.createForClass(ActivityLog);
exports.ActivityLogSchema.index({ action: 1 });
exports.ActivityLogSchema.index({ chat_id: 1 });
exports.ActivityLogSchema.index({ createdAt: -1 });
//# sourceMappingURL=activity-log.schema.js.map