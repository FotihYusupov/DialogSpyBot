import { Model } from 'mongoose';
import { SavedMessage } from './schemas/saved-message.schema';
export declare class SavedMessagesService {
    private savedModel;
    private readonly logger;
    constructor(savedModel: Model<SavedMessage>);
    save(data: {
        owner_id: number;
        business_connection_id?: string;
        original_message_id?: number;
        chat_id?: number;
        chat_title?: string;
        sender_id?: number;
        sender_first_name?: string;
        sender_last_name?: string;
        sender_username?: string;
        text?: string;
        media_type?: string;
        media_file_id?: string;
        note?: string;
    }): Promise<SavedMessage>;
    findByOwner(ownerId: number, page?: number, limit?: number): Promise<{
        items: SavedMessage[];
        total: number;
        page: number;
        limit: number;
    }>;
    isAlreadySaved(ownerId: number, originalMessageId: number): Promise<boolean>;
    deleteById(savedId: string, ownerId: number): Promise<boolean>;
    deleteAll(ownerId: number): Promise<number>;
    countByOwner(ownerId: number): Promise<number>;
}
