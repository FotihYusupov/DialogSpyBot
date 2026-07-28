export interface ExtractedRuleFact {
    type: 'phone' | 'email' | 'website' | 'github' | 'gitlab' | 'linkedin' | 'telegram' | 'instagram' | 'twitter' | 'discord' | 'maps' | 'address' | 'flight_number' | 'tracking_number' | 'card_number' | 'invoice_number' | 'date' | 'time';
    value: string;
    confidence: number;
}
export declare class RuleEngineService {
    private readonly logger;
    private readonly PHONE_REGEX;
    private readonly EMAIL_REGEX;
    private readonly URL_REGEX;
    private readonly TG_HANDLE_REGEX;
    private readonly GITHUB_REGEX;
    private readonly GITLAB_REGEX;
    private readonly LINKEDIN_REGEX;
    private readonly INSTAGRAM_REGEX;
    private readonly TWITTER_REGEX;
    private readonly MAPS_REGEX;
    private readonly FLIGHT_REGEX;
    private readonly TRACKING_REGEX;
    private readonly CARD_REGEX;
    private readonly INVOICE_REGEX;
    private readonly DATE_REGEX;
    private readonly TIME_REGEX;
    extractRuleFacts(text?: string): ExtractedRuleFact[];
}
