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
exports.ContactProfileSchema = exports.ContactProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ContactProfile = class ContactProfile extends mongoose_2.Document {
};
exports.ContactProfile = ContactProfile;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], ContactProfile.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], ContactProfile.prototype, "contactId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], ContactProfile.prototype, "chatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], ContactProfile.prototype, "telegramId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ContactProfile.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ContactProfile.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ContactProfile.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], ContactProfile.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "facts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "interests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "skills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "companies", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "education", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "phones", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "emails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "links", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "locations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "languages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "birthdays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "importantDates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ContactProfile.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'Uzbekistan' }),
    __metadata("design:type", String)
], ContactProfile.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'uz' }),
    __metadata("design:type", String)
], ContactProfile.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 92 }),
    __metadata("design:type", Number)
], ContactProfile.prototype, "confidenceScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], ContactProfile.prototype, "firstSeen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], ContactProfile.prototype, "lastSeen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, index: true }),
    __metadata("design:type", Date)
], ContactProfile.prototype, "lastUpdated", void 0);
exports.ContactProfile = ContactProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ContactProfile);
exports.ContactProfileSchema = mongoose_1.SchemaFactory.createForClass(ContactProfile);
exports.ContactProfileSchema.index({ ownerId: 1, contactId: 1 }, { unique: true });
exports.ContactProfileSchema.index({ ownerId: 1, lastSeen: -1 });
exports.ContactProfileSchema.index({ ownerId: 1, lastUpdated: -1 });
exports.ContactProfileSchema.index({ country: 1 });
exports.ContactProfileSchema.index({ language: 1 });
//# sourceMappingURL=contact-profile.schema.js.map