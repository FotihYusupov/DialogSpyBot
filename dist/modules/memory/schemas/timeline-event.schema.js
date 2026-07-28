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
exports.TimelineEventSchema = exports.TimelineEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TimelineEvent = class TimelineEvent extends mongoose_2.Document {
};
exports.TimelineEvent = TimelineEvent;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], TimelineEvent.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], TimelineEvent.prototype, "contactId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], TimelineEvent.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'general' }),
    __metadata("design:type", String)
], TimelineEvent.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], TimelineEvent.prototype, "eventDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], TimelineEvent.prototype, "sourceMessageId", void 0);
exports.TimelineEvent = TimelineEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TimelineEvent);
exports.TimelineEventSchema = mongoose_1.SchemaFactory.createForClass(TimelineEvent);
exports.TimelineEventSchema.index({ ownerId: 1, contactId: 1, title: 1 });
exports.TimelineEventSchema.index({ ownerId: 1, eventDate: -1 });
//# sourceMappingURL=timeline-event.schema.js.map