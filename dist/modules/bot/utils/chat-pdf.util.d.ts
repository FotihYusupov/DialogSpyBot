export interface ChatPdfMessage {
    message_id?: number;
    sender_id?: number;
    sender_first_name?: string;
    sender_last_name?: string;
    sender_username?: string;
    text?: string;
    media_type?: string;
    media_file_id?: string;
    media_file_path?: string;
    is_deleted?: boolean;
    is_edited?: boolean;
    edit_history?: Array<{
        text: string;
        date?: Date;
    }>;
    date?: Date;
    createdAt?: Date;
}
export interface GenerateChatPdfOptions {
    ownerId: number;
    chatId: number;
    chatTitle: string;
    messages: ChatPdfMessage[];
    fromDate?: Date;
    toDate?: Date;
}
export declare function generateChatPdf(options: GenerateChatPdfOptions): Promise<string>;
