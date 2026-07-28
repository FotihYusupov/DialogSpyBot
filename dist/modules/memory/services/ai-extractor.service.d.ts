export interface SemanticFactResult {
    type: 'occupation' | 'company' | 'education' | 'location' | 'interest' | 'skill' | 'project' | 'goal' | 'language' | 'milestone';
    value: string;
    category?: string;
    confidence: number;
}
export declare class AIExtractorService {
    private readonly logger;
    extractSemanticFacts(text?: string): Promise<SemanticFactResult[]>;
    private cleanValue;
}
