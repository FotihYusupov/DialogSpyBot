import { Document } from 'mongoose';
export declare class EditHistory {
    text: string;
    date: Date;
}
export declare class BusinessMessage extends Document {
    owner_id?: number;
    business_connection_id?: string;
    message_id: number;
    chat_id: number;
    chat_title?: string;
    chat_type?: string;
    sender_id: number;
    sender_first_name?: string;
    sender_last_name?: string;
    sender_username?: string;
    text?: string;
    media_type?: string;
    media_file_id?: string;
    media_file_path?: string;
    is_deleted: boolean;
    is_edited: boolean;
    edit_history: EditHistory[];
    date: Date;
}
export declare const BusinessMessageSchema: import("mongoose").Schema<BusinessMessage, import("mongoose").Model<BusinessMessage, any, any, any, any, any, BusinessMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BusinessMessage, Document<unknown, {}, BusinessMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    text?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_id?: import("mongoose").SchemaDefinitionProperty<number, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    business_connection_id?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    owner_id?: import("mongoose").SchemaDefinitionProperty<number, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    message_id?: import("mongoose").SchemaDefinitionProperty<number, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_title?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_type?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_id?: import("mongoose").SchemaDefinitionProperty<number, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_first_name?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_last_name?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sender_username?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    media_type?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    media_file_id?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    media_file_path?: import("mongoose").SchemaDefinitionProperty<string, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    is_deleted?: import("mongoose").SchemaDefinitionProperty<boolean, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    is_edited?: import("mongoose").SchemaDefinitionProperty<boolean, BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    edit_history?: import("mongoose").SchemaDefinitionProperty<EditHistory[], BusinessMessage, Document<unknown, {}, BusinessMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, BusinessMessage>;
