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
var PremiumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumService = exports.REGISTERED_PREMIUM_FEATURES = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
exports.REGISTERED_PREMIUM_FEATURES = {
    saved_items: { key: 'saved_items', name: 'Saved Items', description: 'Save important chat messages', icon: '⭐' },
    reminders: { key: 'reminders', name: 'Reminders', description: 'Schedule reminders for messages', icon: '⏰' },
    ai_search: { key: 'ai_search', name: 'AI Search', description: 'Semantic and intelligent message search', icon: '🤖' },
    smart_insights: { key: 'smart_insights', name: 'Smart Insights', description: 'Advanced chat analytics & insights', icon: '💡' },
    collections: { key: 'collections', name: 'Collections', description: 'Organize messages into collections', icon: '📁' },
    statistics: { key: 'statistics', name: 'Statistics', description: 'Detailed account metrics and activity stats', icon: '📊' },
};
let PremiumService = PremiumService_1 = class PremiumService {
    constructor(userModel) {
        this.userModel = userModel;
        this.logger = new common_1.Logger(PremiumService_1.name);
    }
    async onApplicationBootstrap() {
        this.logger.log('🔄 Running database migration for user premium fields...');
        try {
            const result = await this.userModel.updateMany({ isPremium: { $exists: false } }, { $set: { isPremium: false, premiumExpiresAt: null } }).exec();
            if (result.modifiedCount > 0) {
                this.logger.log(`✅ Migrated ${result.modifiedCount} existing users with default premium values.`);
            }
            else {
                this.logger.log('✅ User premium fields are up-to-date.');
            }
        }
        catch (err) {
            this.logger.error(`❌ Premium fields migration error: ${err.message}`, err.stack);
        }
    }
    isPremiumActive(user) {
        return (0, user_schema_1.isPremiumActive)(user);
    }
    async enablePremium(userId, expiresAt) {
        const user = await this.findUserByIdentifier(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        let expiryDate = null;
        if (expiresAt) {
            expiryDate = new Date(expiresAt);
            if (isNaN(expiryDate.getTime())) {
                throw new Error('Invalid expiration date provided');
            }
        }
        user.isPremium = true;
        user.premiumExpiresAt = expiryDate;
        return user.save();
    }
    async disablePremium(userId) {
        const user = await this.findUserByIdentifier(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        user.isPremium = false;
        user.premiumExpiresAt = null;
        return user.save();
    }
    hasFeatureAccess(user, featureKey) {
        if (!exports.REGISTERED_PREMIUM_FEATURES[featureKey]) {
            return false;
        }
        return this.isPremiumActive(user);
    }
    getAvailableFeatures() {
        return Object.values(exports.REGISTERED_PREMIUM_FEATURES);
    }
    getPremiumStatusDetails(user) {
        const active = this.isPremiumActive(user);
        if (!active || !user) {
            return {
                isPremiumActive: false,
                isLifetime: false,
                expiresAt: null,
                remainingDays: 0,
                formattedStatus: 'Free',
            };
        }
        if (user.premiumExpiresAt === null || user.premiumExpiresAt === undefined) {
            return {
                isPremiumActive: true,
                isLifetime: true,
                expiresAt: null,
                remainingDays: null,
                formattedStatus: '⭐ Premium (Lifetime)',
            };
        }
        const expiresAt = new Date(user.premiumExpiresAt);
        const now = Date.now();
        const diffMs = expiresAt.getTime() - now;
        const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
            isPremiumActive: true,
            isLifetime: false,
            expiresAt: expiresAt.toISOString(),
            remainingDays,
            formattedStatus: `⭐ Premium (${remainingDays} days left)`,
        };
    }
    async findUserByIdentifier(userId) {
        const numericId = typeof userId === 'number' ? userId : parseInt(userId, 10);
        if (!isNaN(numericId)) {
            const user = await this.userModel.findOne({ chat_id: numericId }).exec();
            if (user)
                return user;
        }
        if (typeof userId === 'string' && mongoose_2.Types.ObjectId.isValid(userId)) {
            return this.userModel.findById(userId).exec();
        }
        return null;
    }
};
exports.PremiumService = PremiumService;
exports.PremiumService = PremiumService = PremiumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PremiumService);
//# sourceMappingURL=premium.service.js.map