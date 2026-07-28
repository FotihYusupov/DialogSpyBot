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
export declare class SmartMemoryService {
    private readonly profileModel;
    private readonly factModel;
    private readonly timelineModel;
    private readonly interestModel;
    private readonly usersService;
    private readonly premiumService;
    private readonly ruleEngine;
    private readonly aiExtractor;
    private readonly logger;
    constructor(profileModel: Model<ContactProfile>, factModel: Model<KnowledgeFact>, timelineModel: Model<TimelineEvent>, interestModel: Model<InterestScore>, usersService: UsersService, premiumService: PremiumService, ruleEngine: RuleEngineService, aiExtractor: AIExtractorService);
    processIncomingMessage(payload: IncomingMessagePayload): Promise<boolean>;
    private upsertFact;
    private upsertInterestScore;
    private upsertTimelineEvent;
    private addUniqueToProfileArray;
    private updateProfileSummary;
    getMemoryStats(ownerId?: number): Promise<{
        totalContacts: number;
        totalFacts: number;
        totalTimelineEvents: number;
        totalInterests: number;
        todayUpdates: number;
    }>;
    getPaginatedContacts(options: {
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
    }): Promise<{
        items: {
            factsCount: number;
            interestsCount: number;
            timelineCount: number;
            ownerId: number;
            contactId: string;
            chatId?: number;
            telegramId?: number;
            firstName?: string;
            lastName?: string;
            username?: string;
            summary: string;
            facts: string[];
            interests: string[];
            skills: string[];
            companies: string[];
            education: string[];
            phones: string[];
            emails: string[];
            links: string[];
            socialLinks: string[];
            locations: string[];
            languages: string[];
            birthdays: string[];
            importantDates: string[];
            notes: string[];
            country?: string;
            language?: string;
            confidenceScore?: number;
            firstSeen: Date;
            lastSeen: Date;
            lastUpdated: Date;
            createdAt: Date;
            updatedAt: Date;
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getContactMemoryGraph(ownerId: number, contactId: string): Promise<{
        profile: import("mongoose").Document<unknown, {}, ContactProfile, {}, import("mongoose").DefaultSchemaOptions> & ContactProfile & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        facts: (import("mongoose").Document<unknown, {}, KnowledgeFact, {}, import("mongoose").DefaultSchemaOptions> & KnowledgeFact & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        timeline: (import("mongoose").Document<unknown, {}, TimelineEvent, {}, import("mongoose").DefaultSchemaOptions> & TimelineEvent & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        interests: (import("mongoose").Document<unknown, {}, InterestScore, {}, import("mongoose").DefaultSchemaOptions> & InterestScore & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    deleteFact(factId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteContactMemory(ownerId: number, contactId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshSummary(contactId: string, ownerId?: number): Promise<{
        success: boolean;
        summary: string;
    }>;
    mergeDuplicates(contactId: string, ownerId?: number): Promise<{
        success: boolean;
        mergedCount: number;
    }>;
    queryKnowledgeGraph(ownerId: number, queryText: string): Promise<{
        results: any[];
        query?: undefined;
        factsCount?: undefined;
        profilesCount?: undefined;
        facts?: undefined;
        profiles?: undefined;
    } | {
        query: string;
        factsCount: number;
        profilesCount: number;
        facts: (import("mongoose").Document<unknown, {}, KnowledgeFact, {}, import("mongoose").DefaultSchemaOptions> & KnowledgeFact & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        profiles: (import("mongoose").Document<unknown, {}, ContactProfile, {}, import("mongoose").DefaultSchemaOptions> & ContactProfile & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        results?: undefined;
    }>;
    private escapeRegex;
}
