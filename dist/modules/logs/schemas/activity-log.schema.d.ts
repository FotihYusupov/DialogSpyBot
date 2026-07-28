import { Document } from 'mongoose';
export declare class ActivityLog extends Document {
    action: 'bot_start' | 'business_connected' | 'business_disconnected';
    chat_id: number;
    username?: string;
    first_name?: string;
    meta?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ActivityLogSchema: import("mongoose").Schema<ActivityLog, import("mongoose").Model<ActivityLog, any, any, any, any, any, ActivityLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActivityLog, Document<unknown, {}, ActivityLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chat_id?: import("mongoose").SchemaDefinitionProperty<number, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    username?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    first_name?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    meta?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    action?: import("mongoose").SchemaDefinitionProperty<"bot_start" | "business_connected" | "business_disconnected", ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ActivityLog>;
