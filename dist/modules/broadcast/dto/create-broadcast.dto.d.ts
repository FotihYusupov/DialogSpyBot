export declare class CreateBroadcastDto {
    text: string;
    mediaType?: string;
    mediaUrl?: string;
    inlineButtons?: Array<{
        text: string;
        url: string;
    }>;
    targetFilter: string;
}
