import { Document } from 'mongoose';
export declare class Reminder extends Document {
    owner_id: number;
    text: string;
    remind_at: Date;
    is_sent: boolean;
    is_cancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ReminderSchema: import("mongoose").Schema<Reminder, import("mongoose").Model<Reminder, any, any, any, any, any, Reminder>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reminder, Document<unknown, {}, Reminder, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    text?: import("mongoose").SchemaDefinitionProperty<string, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    owner_id?: import("mongoose").SchemaDefinitionProperty<number, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    remind_at?: import("mongoose").SchemaDefinitionProperty<Date, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    is_sent?: import("mongoose").SchemaDefinitionProperty<boolean, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    is_cancelled?: import("mongoose").SchemaDefinitionProperty<boolean, Reminder, Document<unknown, {}, Reminder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reminder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Reminder>;
