import { Document } from 'mongoose';
export declare class SavedMessage extends Document {
    owner_id: number;
    business_connection_id?: string;
    original_message_id?: number;
    chat_id?: number;
    chat_title?: string;
    sender_id?: number;
    sender_first_name?: string;
    sender_last_name?: string;
    sender_username?: string;
    text: string;
    media_type?: string;
    media_file_id?: string;
    note?: string;
    saved_at: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SavedMessageSchema: import("mongoose").Schema<SavedMessage, import("mongoose").Model<SavedMessage, any, any, any, any, any, SavedMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavedMessage, Document<unknown, {}, SavedMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    text?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_id?: import("mongoose").SchemaDefinitionProperty<number, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    business_connection_id?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    owner_id?: import("mongoose").SchemaDefinitionProperty<number, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_title?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_id?: import("mongoose").SchemaDefinitionProperty<number, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_first_name?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_last_name?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_username?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    media_type?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    media_file_id?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    original_message_id?: import("mongoose").SchemaDefinitionProperty<number, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    note?: import("mongoose").SchemaDefinitionProperty<string, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    saved_at?: import("mongoose").SchemaDefinitionProperty<Date, SavedMessage, Document<unknown, {}, SavedMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SavedMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, SavedMessage>;
