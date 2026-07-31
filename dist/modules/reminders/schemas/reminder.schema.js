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
exports.ReminderSchema = exports.Reminder = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Reminder = class Reminder extends mongoose_2.Document {
};
exports.Reminder = Reminder;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], Reminder.prototype, "owner_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Reminder.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true, index: true }),
    __metadata("design:type", Date)
], Reminder.prototype, "remind_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Reminder.prototype, "is_sent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Reminder.prototype, "is_cancelled", void 0);
exports.Reminder = Reminder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Reminder);
exports.ReminderSchema = mongoose_1.SchemaFactory.createForClass(Reminder);
exports.ReminderSchema.index({ owner_id: 1, is_sent: 1, remind_at: 1 });
exports.ReminderSchema.index({ remind_at: 1, is_sent: 1, is_cancelled: 1 });
//# sourceMappingURL=reminder.schema.js.map