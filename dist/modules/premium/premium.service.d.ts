import { OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
export type PremiumFeatureKey = 'saved_items' | 'reminders' | 'ai_search' | 'smart_insights' | 'collections' | 'statistics';
export interface PremiumFeatureConfig {
    key: PremiumFeatureKey;
    name: string;
    description: string;
    icon: string;
}
export declare const REGISTERED_PREMIUM_FEATURES: Record<PremiumFeatureKey, PremiumFeatureConfig>;
export declare class PremiumService implements OnApplicationBootstrap {
    private readonly userModel;
    private readonly logger;
    constructor(userModel: Model<User>);
    onApplicationBootstrap(): Promise<void>;
    isPremiumActive(user?: Partial<User> | null): boolean;
    enablePremium(userId: number | string, expiresAt?: Date | string | null): Promise<User>;
    disablePremium(userId: number | string): Promise<User>;
    hasFeatureAccess(user: Partial<User> | null, featureKey: PremiumFeatureKey): boolean;
    getAvailableFeatures(): PremiumFeatureConfig[];
    getPremiumStatusDetails(user?: Partial<User> | null): {
        isPremiumActive: boolean;
        isLifetime: boolean;
        expiresAt: string;
        remainingDays: number;
        formattedStatus: string;
    };
    private findUserByIdentifier;
}
