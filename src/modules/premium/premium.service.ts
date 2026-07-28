import { Injectable, OnApplicationBootstrap, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, isPremiumActive } from '../users/schemas/user.schema';

export type PremiumFeatureKey = 
  | 'saved_items'
  | 'reminders'
  | 'ai_search'
  | 'smart_insights'
  | 'collections'
  | 'statistics';

export interface PremiumFeatureConfig {
  key: PremiumFeatureKey;
  name: string;
  description: string;
  icon: string;
}

export const REGISTERED_PREMIUM_FEATURES: Record<PremiumFeatureKey, PremiumFeatureConfig> = {
  saved_items: { key: 'saved_items', name: 'Saved Items', description: 'Save important chat messages', icon: '⭐' },
  reminders: { key: 'reminders', name: 'Reminders', description: 'Schedule reminders for messages', icon: '⏰' },
  ai_search: { key: 'ai_search', name: 'AI Search', description: 'Semantic and intelligent message search', icon: '🤖' },
  smart_insights: { key: 'smart_insights', name: 'Smart Insights', description: 'Advanced chat analytics & insights', icon: '💡' },
  collections: { key: 'collections', name: 'Collections', description: 'Organize messages into collections', icon: '📁' },
  statistics: { key: 'statistics', name: 'Statistics', description: 'Detailed account metrics and activity stats', icon: '📊' },
};

@Injectable()
export class PremiumService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PremiumService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('🔄 Running database migration for user premium fields...');
    try {
      // Migrate existing users without isPremium property
      const result = await this.userModel.updateMany(
        { isPremium: { $exists: false } },
        { $set: { isPremium: false, premiumExpiresAt: null } }
      ).exec();
      
      if (result.modifiedCount > 0) {
        this.logger.log(`✅ Migrated ${result.modifiedCount} existing users with default premium values.`);
      } else {
        this.logger.log('✅ User premium fields are up-to-date.');
      }
    } catch (err: any) {
      this.logger.error(`❌ Premium fields migration error: ${err.message}`, err.stack);
    }
  }

  /**
   * Single source of truth for checking if a user has active premium subscription.
   */
  isPremiumActive(user?: Partial<User> | null): boolean {
    return isPremiumActive(user);
  }

  /**
   * Enables premium for a user by chat_id or Mongo ObjectId.
   * @param userId chat_id (number/string) or ObjectId string
   * @param expiresAt null or undefined for lifetime, or Date / ISO date string
   */
  async enablePremium(userId: number | string, expiresAt?: Date | string | null): Promise<User> {
    const user = await this.findUserByIdentifier(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let expiryDate: Date | null = null;
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

  /**
   * Disables premium for a user by chat_id or Mongo ObjectId.
   */
  async disablePremium(userId: number | string): Promise<User> {
    const user = await this.findUserByIdentifier(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.isPremium = false;
    user.premiumExpiresAt = null;
    return user.save();
  }

  /**
   * Checks if user has active access to a specific premium module feature.
   */
  hasFeatureAccess(user: Partial<User> | null, featureKey: PremiumFeatureKey): boolean {
    if (!REGISTERED_PREMIUM_FEATURES[featureKey]) {
      return false;
    }
    return this.isPremiumActive(user);
  }

  /**
   * Returns list of all available premium features in the system (future-proof registry).
   */
  getAvailableFeatures(): PremiumFeatureConfig[] {
    return Object.values(REGISTERED_PREMIUM_FEATURES);
  }

  /**
   * Calculates remaining premium time details.
   */
  getPremiumStatusDetails(user?: Partial<User> | null) {
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

  private async findUserByIdentifier(userId: number | string): Promise<User | null> {
    const numericId = typeof userId === 'number' ? userId : parseInt(userId, 10);
    if (!isNaN(numericId)) {
      const user = await this.userModel.findOne({ chat_id: numericId }).exec();
      if (user) return user;
    }

    if (typeof userId === 'string' && Types.ObjectId.isValid(userId)) {
      return this.userModel.findById(userId).exec();
    }

    return null;
  }
}
