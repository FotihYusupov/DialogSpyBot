import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactProfile } from './schemas/contact-profile.schema';
import { KnowledgeFact } from './schemas/knowledge-fact.schema';
import { TimelineEvent } from './schemas/timeline-event.schema';
import { InterestScore } from './schemas/interest-score.schema';
import { UsersService } from '../users/users.service';
import { PremiumService } from '../premium/premium.service';
import { RuleEngineService } from './services/rule-engine.service';
import { AIExtractorService } from './services/ai-extractor.service';

export interface IncomingMessagePayload {
  ownerId: number;
  messageId: number | string;
  chatId: number;
  senderId: number;
  senderFirstName?: string;
  senderLastName?: string;
  senderUsername?: string;
  text?: string;
  date?: Date;
}

@Injectable()
export class SmartMemoryService {
  private readonly logger = new Logger(SmartMemoryService.name);

  constructor(
    @InjectModel(ContactProfile.name) private readonly profileModel: Model<ContactProfile>,
    @InjectModel(KnowledgeFact.name) private readonly factModel: Model<KnowledgeFact>,
    @InjectModel(TimelineEvent.name) private readonly timelineModel: Model<TimelineEvent>,
    @InjectModel(InterestScore.name) private readonly interestModel: Model<InterestScore>,
    private readonly usersService: UsersService,
    private readonly premiumService: PremiumService,
    private readonly ruleEngine: RuleEngineService,
    private readonly aiExtractor: AIExtractorService
  ) {}

  /**
   * Main pipeline triggered on every incoming business message.
   * STRICTLY GUARDED FOR ACTIVE PREMIUM USERS ONLY.
   */
  async processIncomingMessage(payload: IncomingMessagePayload): Promise<boolean> {
    const { ownerId, messageId, chatId, senderId, senderFirstName, senderLastName, senderUsername, text } = payload;
    if (!text || text.trim().length === 0) return false;

    // 1. Premium Guard Check: Only active premium users have Smart Memory processing
    const ownerUser = await this.usersService.findByChatId(ownerId);
    if (!ownerUser || !this.premiumService.isPremiumActive(ownerUser)) {
      // Non-premium user: do not extract, do not save, do not process
      return false;
    }

    const contactId = String(senderId);

    // 2. Fetch or Create Contact Profile
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
    } else {
      profile.lastSeen = now;
      profile.lastUpdated = now;
      if (senderFirstName) profile.firstName = senderFirstName;
      if (senderLastName) profile.lastName = senderLastName;
      if (senderUsername) profile.username = senderUsername;
    }

    // 3. Extract Facts via Rule Engine & AI Extractor
    const ruleFacts = this.ruleEngine.extractRuleFacts(text);
    const semanticFacts = await this.aiExtractor.extractSemanticFacts(text);

    // Combine all facts
    const allExtracted = [
      ...ruleFacts.map(f => ({ type: f.type, value: f.value, confidence: f.confidence })),
      ...semanticFacts.map(f => ({ type: f.type, value: f.value, category: f.category, confidence: f.confidence }))
    ];

    if (allExtracted.length === 0) {
      await profile.save();
      return true;
    }

    // 4. Merge & Deduplicate Facts in Database
    for (const item of allExtracted) {
      if (item.type === 'milestone') {
        // Handle Timeline Events
        await this.upsertTimelineEvent(ownerId, contactId, item.value, item.category || 'milestone', messageId);
        continue;
      }

      await this.upsertFact(ownerId, contactId, chatId, item.type, item.value, item.confidence, messageId, profile);
    }

    // 5. Auto-rebuild Dynamic Profile Summary
    await this.updateProfileSummary(profile);

    return true;
  }

  private async upsertFact(
    ownerId: number,
    contactId: string,
    chatId: number,
    type: string,
    value: string,
    confidence: number,
    sourceMessageId: number | string,
    profile: ContactProfile
  ) {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    // Check for exact type+value match for this owner & contact
    const existing = await this.factModel.findOne({
      ownerId,
      contactId,
      type,
      value: { $regex: `^${this.escapeRegex(cleanValue)}$`, $options: 'i' }
    }).exec();

    if (existing) {
      // Increase confidence score without duplicating
      existing.confidence = Math.min(1.0, Number((existing.confidence + 0.1).toFixed(2)));
      existing.updatedAt = new Date();
      existing.sourceMessageId = sourceMessageId;
      await existing.save();
    } else {
      // Create new fact
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

    // Update Profile Array collections
    this.addUniqueToProfileArray(profile, type, cleanValue);

    // Interest Engine Score Updates
    if (type === 'interest' || type === 'skill') {
      await this.upsertInterestScore(ownerId, contactId, cleanValue);
    }
  }

  private async upsertInterestScore(ownerId: number, contactId: string, topic: string) {
    const existing = await this.interestModel.findOne({ ownerId, contactId, topic: { $regex: `^${this.escapeRegex(topic)}$`, $options: 'i' } }).exec();
    if (existing) {
      existing.score = Number((existing.score + 0.5).toFixed(2));
      existing.lastDiscussedAt = new Date();
      await existing.save();
    } else {
      await this.interestModel.create({
        ownerId,
        contactId,
        topic,
        score: 1.0,
        lastDiscussedAt: new Date(),
      });
    }
  }

  private async upsertTimelineEvent(ownerId: number, contactId: string, title: string, category: string, sourceMessageId: number | string) {
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

  private addUniqueToProfileArray(profile: ContactProfile, type: string, value: string) {
    const pushIfMissing = (arrName: keyof ContactProfile) => {
      const arr = (profile[arrName] as string[]) || [];
      if (!arr.some(v => v.toLowerCase() === value.toLowerCase())) {
        arr.push(value);
        (profile as any)[arrName] = arr;
      }
    };

    switch (type) {
      case 'phone': pushIfMissing('phones'); break;
      case 'email': pushIfMissing('emails'); break;
      case 'website': pushIfMissing('links'); break;
      case 'github':
      case 'gitlab':
      case 'linkedin':
      case 'instagram':
      case 'twitter':
      case 'discord':
      case 'telegram': pushIfMissing('socialLinks'); break;
      case 'company': pushIfMissing('companies'); break;
      case 'education': pushIfMissing('education'); break;
      case 'skill': pushIfMissing('skills'); break;
      case 'interest': pushIfMissing('interests'); break;
      case 'location': pushIfMissing('locations'); break;
      default: pushIfMissing('facts'); break;
    }
  }

  private async updateProfileSummary(profile: ContactProfile) {
    const factsList: string[] = [];
    if (profile.companies.length > 0) factsList.push(`${profile.companies[0]} kompaniyasida ishlaydi`);
    if (profile.locations.length > 0) factsList.push(`${profile.locations[0]} shahrida yashaydi`);
    if (profile.education.length > 0) factsList.push(`${profile.education[0]} da tahsil olgan`);
    if (profile.skills.length > 0) factsList.push(`Ko'nikmalar: ${profile.skills.slice(0, 4).join(', ')}`);
    if (profile.interests.length > 0) factsList.push(`Qiziqishlari: ${profile.interests.slice(0, 3).join(', ')}`);

    profile.summary = factsList.length > 0
      ? factsList.join('. ') + '.'
      : 'Kontakt profili yaratildi.';
    await profile.save();
  }

  // --- API & QUERY METHODS ---

  async getMemoryStats(ownerId?: number) {
    const filter: any = {};
    if (ownerId) filter.ownerId = Number(ownerId);

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

  async getPaginatedContacts(options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    ownerId?: number;
    premiumOnly?: boolean;
    updatedToday?: boolean;
    updatedThisWeek?: boolean;
    hasFacts?: boolean;
    hasInterests?: boolean;
    hasTimeline?: boolean;
    language?: string;
    country?: string;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

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
    } else if (options.updatedThisWeek === true) {
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
    const sortObj: any = { [sortField]: sortDir, _id: -1 };

    const [profiles, total] = await Promise.all([
      this.profileModel.find(filter).sort(sortObj).skip(skip).limit(limit).exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    // Enhance profiles with exact counts
    const items = await Promise.all(
      profiles.map(async (profile) => {
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
      })
    );

    return { items, total, page, limit };
  }

  async getContactMemoryGraph(ownerId: number, contactId: string) {
    const filter: any = { contactId };
    if (ownerId) filter.ownerId = ownerId;

    const profile = await this.profileModel.findOne(filter).exec();
    if (!profile) {
      throw new NotFoundException(`Contact memory profile for ID ${contactId} not found`);
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

  async deleteFact(factId: string) {
    const fact = await this.factModel.findByIdAndDelete(factId).exec();
    if (!fact) throw new NotFoundException('Fact not found');
    return { success: true, message: 'Fact deleted successfully' };
  }

  async deleteContactMemory(ownerId: number, contactId: string) {
    const filter: any = { contactId };
    if (ownerId) filter.ownerId = ownerId;

    await Promise.all([
      this.profileModel.deleteOne(filter).exec(),
      this.factModel.deleteMany(filter).exec(),
      this.timelineModel.deleteMany(filter).exec(),
      this.interestModel.deleteMany(filter).exec(),
    ]);
    return { success: true, message: `Memory deleted for contact ${contactId}` };
  }

  async refreshSummary(contactId: string, ownerId?: number) {
    const filter: any = { contactId };
    if (ownerId) filter.ownerId = ownerId;

    const profile = await this.profileModel.findOne(filter).exec();
    if (!profile) throw new NotFoundException('Profile not found');

    await this.updateProfileSummary(profile);
    return { success: true, summary: profile.summary };
  }

  async mergeDuplicates(contactId: string, ownerId?: number) {
    const filter: any = { contactId };
    if (ownerId) filter.ownerId = ownerId;

    const facts = await this.factModel.find(filter).exec();
    const seen = new Set<string>();
    let deletedCount = 0;

    for (const f of facts) {
      const key = `${f.type.toLowerCase()}:${f.value.toLowerCase().trim()}`;
      if (seen.has(key)) {
        await this.factModel.deleteOne({ _id: f._id }).exec();
        deletedCount++;
      } else {
        seen.add(key);
      }
    }

    return { success: true, mergedCount: deletedCount };
  }

  async queryKnowledgeGraph(ownerId: number, queryText: string) {
    const ownerUser = await this.usersService.findByChatId(ownerId);
    if (!ownerUser || !this.premiumService.isPremiumActive(ownerUser)) {
      throw new ForbiddenException('Smart Memory search requires an active Premium subscription.');
    }

    const cleanQuery = queryText.trim();
    if (!cleanQuery) return { results: [] };
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

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

