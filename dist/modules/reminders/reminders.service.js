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
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reminder_schema_1 = require("./schemas/reminder.schema");
let RemindersService = RemindersService_1 = class RemindersService {
    constructor(reminderModel) {
        this.reminderModel = reminderModel;
        this.logger = new common_1.Logger(RemindersService_1.name);
    }
    parseReminderText(input) {
        const trimmed = input.trim();
        if (!trimmed) {
            return { remindAt: null, text: '', error: "Eslatma matni bo'sh. Masalan: /eslatma 30m Shifokorga boring" };
        }
        const parts = trimmed.split(/\s+/);
        const timeStr = parts[0];
        const text = parts.slice(1).join(' ');
        if (!text) {
            return { remindAt: null, text: '', error: "Eslatma matnini kiriting. Masalan: /eslatma 30m Shifokorga boring" };
        }
        const now = new Date();
        let remindAt = null;
        const intervalMatch = timeStr.match(/^(\d+)(m|min|daqiqa|s|soat|h|d|kun|day)$/i);
        if (intervalMatch) {
            const amount = parseInt(intervalMatch[1], 10);
            const unit = intervalMatch[2].toLowerCase();
            const ms = now.getTime();
            if (['m', 'min', 'daqiqa'].includes(unit)) {
                remindAt = new Date(ms + amount * 60 * 1000);
            }
            else if (['s', 'soat', 'h'].includes(unit)) {
                remindAt = new Date(ms + amount * 60 * 60 * 1000);
            }
            else if (['d', 'kun', 'day'].includes(unit)) {
                remindAt = new Date(ms + amount * 24 * 60 * 60 * 1000);
            }
        }
        if (!remindAt) {
            const timeOfDayMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (timeOfDayMatch) {
                const hours = parseInt(timeOfDayMatch[1], 10);
                const minutes = parseInt(timeOfDayMatch[2], 10);
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    const target = new Date(now);
                    target.setHours(hours, minutes, 0, 0);
                    if (target <= now) {
                        target.setDate(target.getDate() + 1);
                    }
                    remindAt = target;
                }
            }
        }
        if (!remindAt) {
            return {
                remindAt: null,
                text,
                error: "Vaqt formati noto'g'ri.\n\n" +
                    "📌 To'g'ri formatlar:\n" +
                    "• /eslatma 30m Shifokorga boring\n" +
                    "• /eslatma 2s Uchrashuv\n" +
                    "• /eslatma 1kun Loyihani topshir\n" +
                    "• /eslatma 15:30 Kechki ovqat",
            };
        }
        return { remindAt, text };
    }
    async create(ownerId, text, remindAt) {
        return this.reminderModel.create({
            owner_id: ownerId,
            text,
            remind_at: remindAt,
            is_sent: false,
            is_cancelled: false,
        });
    }
    async findActiveByOwner(ownerId) {
        return this.reminderModel
            .find({
            owner_id: ownerId,
            is_sent: false,
            is_cancelled: false,
            remind_at: { $gte: new Date() },
        })
            .sort({ remind_at: 1 })
            .exec();
    }
    async findDueReminders() {
        const now = new Date();
        const soon = new Date(now.getTime() + 60 * 1000);
        return this.reminderModel
            .find({
            is_sent: false,
            is_cancelled: false,
            remind_at: { $lte: soon },
        })
            .exec();
    }
    async markSent(reminderId) {
        await this.reminderModel.findByIdAndUpdate(reminderId, { is_sent: true }).exec();
    }
    async cancel(reminderId, ownerId) {
        const result = await this.reminderModel.findOneAndUpdate({ _id: reminderId, owner_id: ownerId, is_sent: false }, { is_cancelled: true }).exec();
        return !!result;
    }
    async countActiveByOwner(ownerId) {
        return this.reminderModel.countDocuments({
            owner_id: ownerId,
            is_sent: false,
            is_cancelled: false,
            remind_at: { $gte: new Date() },
        }).exec();
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map