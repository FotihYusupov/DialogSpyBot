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
var SmartMemoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMemoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const contact_profile_schema_1 = require("./schemas/contact-profile.schema");
const knowledge_fact_schema_1 = require("./schemas/knowledge-fact.schema");
const timeline_event_schema_1 = require("./schemas/timeline-event.schema");
const interest_score_schema_1 = require("./schemas/interest-score.schema");
const users_service_1 = require("../users/users.service");
const premium_service_1 = require("../premium/premium.service");
const rule_engine_service_1 = require("./services/rule-engine.service");
const ai_extractor_service_1 = require("./services/ai-extractor.service");
let SmartMemoryService = SmartMemoryService_1 = class SmartMemoryService {
    constructor(profileModel, factModel, timelineModel, interestModel, usersService, premiumService, ruleEngine, aiExtractor) {
        this.profileModel = profileModel;
        this.factModel = factModel;
        this.timelineModel = timelineModel;
        this.interestModel = interestModel;
        this.usersService = usersService;
        this.premiumService = premiumService;
        this.ruleEngine = ruleEngine;
        this.aiExtractor = aiExtractor;
        this.logger = new common_1.Logger(SmartMemoryService_1.name);
    }
    async processIncomingMessage(payload) {
        const { ownerId, messageId, chatId, senderId, senderFirstName, senderLastName, senderUsername, text } = payload;
        if (!text || text.trim().length === 0)
            return false;
        const ownerUser = await this.usersService.findByChatId(ownerId);
        if (!ownerUser || !this.premiumService.isPremiumActive(ownerUser)) {
            return false;
        }
        const contactId = String(senderId);
        let profile = await this.profileModel.findOne({ ownerId, contactId }).exec();
        const now = new Date();
        if (!profile) {
            profile = new this.profileModel({
                ownerId,
                contactId,
                chatId,
                telegramId: senderId,
                firstName: senderFirstName || '',
                lastName: senderLastName || '',
                username: senderUsername || '',
                firstSeen: now,
                lastSeen: now,
                lastUpdated: now,
            });
        }
        else {
            profile.lastSeen = now;
            profile.lastUpdated = now;
            if (senderFirstName)
                profile.firstName = senderFirstName;
            if (senderLastName)
                profile.lastName = senderLastName;
            if (senderUsername)
                profile.username = senderUsername;
        }
        const ruleFacts = this.ruleEngine.extractRuleFacts(text);
        const semanticFacts = await this.aiExtractor.extractSemanticFacts(text);
        const allExtracted = [
            ...ruleFacts.map(f => ({ type: f.type, value: f.value, confidence: f.confidence })),
            ...semanticFacts.map(f => ({ type: f.type, value: f.value, category: f.category, confidence: f.confidence }))
        ];
        if (allExtracted.length === 0) {
            await profile.save();
            return true;
        }
        for (const item of allExtracted) {
            if (item.type === 'milestone') {
                await this.upsertTimelineEvent(ownerId, contactId, item.value, item.category || 'milestone', messageId);
                continue;
            }
            await this.upsertFact(ownerId, contactId, chatId, item.type, item.value, item.confidence, messageId, profile);
        }
        await this.updateProfileSummary(profile);
        return true;
    }
    async upsertFact(ownerId, contactId, chatId, type, value, confidence, sourceMessageId, profile) {
        const cleanValue = value.trim();
        if (!cleanValue)
            return;
        const existing = await this.factModel.findOne({
            ownerId,
            contactId,
            type,
            value: { $regex: `^${this.escapeRegex(cleanValue)}$`, $options: 'i' }
        }).exec();
        if (existing) {
            existing.confidence = Math.min(1.0, Number((existing.confidence + 0.1).toFixed(2)));
            existing.updatedAt = new Date();
            existing.sourceMessageId = sourceMessageId;
            await existing.save();
        }
        else {
            await this.factModel.create({
                ownerId,
                contactId,
                chatId,
                type,
                value: cleanValue,
                confidence,
                sourceMessageId,
            });
        }
        this.addUniqueToProfileArray(profile, type, cleanValue);
        if (type === 'interest' || type === 'skill') {
            await this.upsertInterestScore(ownerId, contactId, cleanValue);
        }
    }
    async upsertInterestScore(ownerId, contactId, topic) {
        const existing = await this.interestModel.findOne({ ownerId, contactId, topic: { $regex: `^${this.escapeRegex(topic)}$`, $options: 'i' } }).exec();
        if (existing) {
            existing.score = Number((existing.score + 0.5).toFixed(2));
            existing.lastDiscussedAt = new Date();
            await existing.save();
        }
        else {
            await this.interestModel.create({
                ownerId,
                contactId,
                topic,
                score: 1.0,
                lastDiscussedAt: new Date(),
            });
        }
    }
    async upsertTimelineEvent(ownerId, contactId, title, category, sourceMessageId) {
        const existing = await this.timelineModel.findOne({ ownerId, contactId, title: { $regex: `^${this.escapeRegex(title)}$`, $options: 'i' } }).exec();
        if (!existing) {
            await this.timelineModel.create({
                ownerId,
                contactId,
                title,
                category,
                eventDate: new Date(),
                sourceMessageId,
            });
        }
    }
    addUniqueToProfileArray(profile, type, value) {
        const pushIfMissing = (arrName) => {
            const arr = profile[arrName] || [];
            if (!arr.some(v => v.toLowerCase() === value.toLowerCase())) {
                arr.push(value);
                profile[arrName] = arr;
            }
        };
        switch (type) {
            case 'phone':
                pushIfMissing('phones');
                break;
            case 'email':
                pushIfMissing('emails');
                break;
            case 'website':
                pushIfMissing('links');
                break;
            case 'github':
            case 'gitlab':
            case 'linkedin':
            case 'instagram':
            case 'twitter':
            case 'discord':
            case 'telegram':
                pushIfMissing('socialLinks');
                break;
            case 'company':
                pushIfMissing('companies');
                break;
            case 'education':
                pushIfMissing('education');
                break;
            case 'skill':
                pushIfMissing('skills');
                break;
            case 'interest':
                pushIfMissing('interests');
                break;
            case 'location':
                pushIfMissing('locations');
                break;
            default:
                pushIfMissing('facts');
                break;
        }
    }
    async updateProfileSummary(profile) {
        const factsList = [];
        if (profile.companies.length > 0)
            factsList.push(`Works at ${profile.companies[0]}`);
        if (profile.locations.length > 0)
            factsList.push(`Lives in ${profile.locations[0]}`);
        if (profile.education.length > 0)
            factsList.push(`Studied at ${profile.education[0]}`);
        if (profile.skills.length > 0)
            factsList.push(`Skills: ${profile.skills.slice(0, 4).join(', ')}`);
        if (profile.interests.length > 0)
            factsList.push(`Interested in ${profile.interests.slice(0, 3).join(', ')}`);
        profile.summary = factsList.join('. ') + (factsList.length > 0 ? '.' : 'Contact profile created.');
        await profile.save();
    }
    async getMemoryStats(ownerId) {
        const filter = {};
        if (ownerId)
            filter.ownerId = Number(ownerId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [totalContacts, totalFacts, totalTimelineEvents, totalInterests, todayUpdates] = await Promise.all([
            this.profileModel.countDocuments(filter).exec(),
            this.factModel.countDocuments(filter).exec(),
            this.timelineModel.countDocuments(filter).exec(),
            this.interestModel.countDocuments(filter).exec(),
            this.profileModel.countDocuments({ ...filter, lastUpdated: { $gte: todayStart } }).exec(),
        ]);
        return {
            totalContacts,
            totalFacts,
            totalTimelineEvents,
            totalInterests,
            todayUpdates,
        };
    }
    async getPaginatedContacts(options) {
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (options.ownerId) {
            filter.ownerId = Number(options.ownerId);
        }
        if (options.language) {
            filter.language = options.language;
        }
        if (options.country) {
            filter.country = { $regex: this.escapeRegex(options.country), $options: 'i' };
        }
        if (options.updatedToday === true) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            filter.lastUpdated = { $gte: startOfDay };
        }
        else if (options.updatedThisWeek === true) {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - 7);
            filter.lastUpdated = { $gte: startOfWeek };
        }
        if (options.hasFacts) {
            filter['facts.0'] = { $exists: true };
        }
        if (options.hasInterests) {
            filter['interests.0'] = { $exists: true };
        }
        if (options.search) {
            const clean = this.escapeRegex(options.search);
            filter.$or = [
                { firstName: { $regex: clean, $options: 'i' } },
                { lastName: { $regex: clean, $options: 'i' } },
                { username: { $regex: clean, $options: 'i' } },
                { summary: { $regex: clean, $options: 'i' } },
            ];
        }
        const sortField = options.sortBy || 'lastUpdated';
        const sortDir = options.sortOrder === 'asc' ? 1 : -1;
        const sortObj = { [sortField]: sortDir, _id: -1 };
        const [profiles, total] = await Promise.all([
            this.profileModel.find(filter).sort(sortObj).skip(skip).limit(limit).exec(),
            this.profileModel.countDocuments(filter).exec(),
        ]);
        const items = await Promise.all(profiles.map(async (profile) => {
            const obj = profile.toObject();
            const [factsCount, interestsCount, timelineCount] = await Promise.all([
                this.factModel.countDocuments({ ownerId: profile.ownerId, contactId: profile.contactId }).exec(),
                this.interestModel.countDocuments({ ownerId: profile.ownerId, contactId: profile.contactId }).exec(),
                this.timelineModel.countDocuments({ ownerId: profile.ownerId, contactId: profile.contactId }).exec(),
            ]);
            return {
                ...obj,
                factsCount,
                interestsCount,
                timelineCount,
            };
        }));
        return { items, total, page, limit };
    }
    async getContactMemoryGraph(ownerId, contactId) {
        const filter = { contactId };
        if (ownerId)
            filter.ownerId = ownerId;
        const profile = await this.profileModel.findOne(filter).exec();
        if (!profile) {
            throw new common_1.NotFoundException(`Contact memory profile for ID ${contactId} not found`);
        }
        const [facts, timeline, interests] = await Promise.all([
            this.factModel.find({ ownerId: profile.ownerId, contactId }).sort({ confidence: -1, updatedAt: -1 }).exec(),
            this.timelineModel.find({ ownerId: profile.ownerId, contactId }).sort({ eventDate: -1 }).exec(),
            this.interestModel.find({ ownerId: profile.ownerId, contactId }).sort({ score: -1 }).exec(),
        ]);
        return {
            profile,
            facts,
            timeline,
            interests,
        };
    }
    async deleteFact(factId) {
        const fact = await this.factModel.findByIdAndDelete(factId).exec();
        if (!fact)
            throw new common_1.NotFoundException('Fact not found');
        return { success: true, message: 'Fact deleted successfully' };
    }
    async deleteContactMemory(ownerId, contactId) {
        const filter = { contactId };
        if (ownerId)
            filter.ownerId = ownerId;
        await Promise.all([
            this.profileModel.deleteOne(filter).exec(),
            this.factModel.deleteMany(filter).exec(),
            this.timelineModel.deleteMany(filter).exec(),
            this.interestModel.deleteMany(filter).exec(),
        ]);
        return { success: true, message: `Memory deleted for contact ${contactId}` };
    }
    async refreshSummary(contactId, ownerId) {
        const filter = { contactId };
        if (ownerId)
            filter.ownerId = ownerId;
        const profile = await this.profileModel.findOne(filter).exec();
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        await this.updateProfileSummary(profile);
        return { success: true, summary: profile.summary };
    }
    async mergeDuplicates(contactId, ownerId) {
        const filter = { contactId };
        if (ownerId)
            filter.ownerId = ownerId;
        const facts = await this.factModel.find(filter).exec();
        const seen = new Set();
        let deletedCount = 0;
        for (const f of facts) {
            const key = `${f.type.toLowerCase()}:${f.value.toLowerCase().trim()}`;
            if (seen.has(key)) {
                await this.factModel.deleteOne({ _id: f._id }).exec();
                deletedCount++;
            }
            else {
                seen.add(key);
            }
        }
        return { success: true, mergedCount: deletedCount };
    }
    async queryKnowledgeGraph(ownerId, queryText) {
        const ownerUser = await this.usersService.findByChatId(ownerId);
        if (!ownerUser || !this.premiumService.isPremiumActive(ownerUser)) {
            throw new common_1.ForbiddenException('Smart Memory search requires an active Premium subscription.');
        }
        const cleanQuery = queryText.trim();
        if (!cleanQuery)
            return { results: [] };
        const safeRegex = this.escapeRegex(cleanQuery);
        const [matchingFacts, matchingProfiles] = await Promise.all([
            this.factModel.find({
                ownerId,
                $or: [
                    { value: { $regex: safeRegex, $options: 'i' } },
                    { type: { $regex: safeRegex, $options: 'i' } },
                ]
            }).limit(20).exec(),
            this.profileModel.find({
                ownerId,
                $or: [
                    { firstName: { $regex: safeRegex, $options: 'i' } },
                    { lastName: { $regex: safeRegex, $options: 'i' } },
                    { username: { $regex: safeRegex, $options: 'i' } },
                    { summary: { $regex: safeRegex, $options: 'i' } },
                ]
            }).limit(10).exec(),
        ]);
        return {
            query: cleanQuery,
            factsCount: matchingFacts.length,
            profilesCount: matchingProfiles.length,
            facts: matchingFacts,
            profiles: matchingProfiles,
        };
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.SmartMemoryService = SmartMemoryService;
exports.SmartMemoryService = SmartMemoryService = SmartMemoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(contact_profile_schema_1.ContactProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(knowledge_fact_schema_1.KnowledgeFact.name)),
    __param(2, (0, mongoose_1.InjectModel)(timeline_event_schema_1.TimelineEvent.name)),
    __param(3, (0, mongoose_1.InjectModel)(interest_score_schema_1.InterestScore.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService,
        premium_service_1.PremiumService,
        rule_engine_service_1.RuleEngineService,
        ai_extractor_service_1.AIExtractorService])
], SmartMemoryService);
//# sourceMappingURL=smart-memory.service.js.map