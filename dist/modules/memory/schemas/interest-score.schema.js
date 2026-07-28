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
exports.InterestScoreSchema = exports.InterestScore = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let InterestScore = class InterestScore extends mongoose_2.Document {
};
exports.InterestScore = InterestScore;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], InterestScore.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], InterestScore.prototype, "contactId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], InterestScore.prototype, "topic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1.0 }),
    __metadata("design:type", Number)
], InterestScore.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], InterestScore.prototype, "lastDiscussedAt", void 0);
exports.InterestScore = InterestScore = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InterestScore);
exports.InterestScoreSchema = mongoose_1.SchemaFactory.createForClass(InterestScore);
exports.InterestScoreSchema.index({ ownerId: 1, contactId: 1, topic: 1 }, { unique: true });
exports.InterestScoreSchema.index({ ownerId: 1, score: -1 });
//# sourceMappingURL=interest-score.schema.js.map