import { SmartMemoryService } from './smart-memory.service';
export declare class MemoryController {
    private readonly memoryService;
    constructor(memoryService: SmartMemoryService);
    getMemoryStats(ownerId?: string): Promise<{
        totalContacts: number;
        totalFacts: number;
        totalTimelineEvents: number;
        totalInterests: number;
        todayUpdates: number;
    }>;
    getContacts(page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', ownerId?: string, premiumOnly?: string, updatedToday?: string, updatedThisWeek?: string, hasFacts?: string, hasInterests?: string, hasTimeline?: string, language?: string, country?: string): Promise<{
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
    getProfiles(ownerId?: string, page?: number, limit?: number, search?: string): Promise<{
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
    getContactGraph(contactId: string, ownerId?: string): Promise<{
        profile: import("mongoose").Document<unknown, {}, import("./schemas/contact-profile.schema").ContactProfile, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact-profile.schema").ContactProfile & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        facts: (import("mongoose").Document<unknown, {}, import("./schemas/knowledge-fact.schema").KnowledgeFact, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/knowledge-fact.schema").KnowledgeFact & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        timeline: (import("mongoose").Document<unknown, {}, import("./schemas/timeline-event.schema").TimelineEvent, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/timeline-event.schema").TimelineEvent & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        interests: (import("mongoose").Document<unknown, {}, import("./schemas/interest-score.schema").InterestScore, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/interest-score.schema").InterestScore & Required<{
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
    deleteContactMemory(contactId: string, ownerId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshSummary(contactId: string, ownerId?: string): Promise<{
        success: boolean;
        summary: string;
    }>;
    mergeDuplicates(contactId: string, ownerId?: string): Promise<{
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
        facts: (import("mongoose").Document<unknown, {}, import("./schemas/knowledge-fact.schema").KnowledgeFact, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/knowledge-fact.schema").KnowledgeFact & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        profiles: (import("mongoose").Document<unknown, {}, import("./schemas/contact-profile.schema").ContactProfile, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact-profile.schema").ContactProfile & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        results?: undefined;
    }>;
}
