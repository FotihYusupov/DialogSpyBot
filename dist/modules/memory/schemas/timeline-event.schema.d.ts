import { Document } from 'mongoose';
export declare class TimelineEvent extends Document {
    ownerId: number;
    contactId: string;
    title: string;
    category: string;
    eventDate: Date;
    sourceMessageId?: string | number;
    sourceText?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TimelineEventSchema: import("mongoose").Schema<TimelineEvent, import("mongoose").Model<TimelineEvent, any, any, any, any, any, TimelineEvent>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TimelineEvent, Document<unknown, {}, TimelineEvent, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    ownerId?: import("mongoose").SchemaDefinitionProperty<number, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    contactId?: import("mongoose").SchemaDefinitionProperty<string, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sourceMessageId?: import("mongoose").SchemaDefinitionProperty<string | number, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sourceText?: import("mongoose").SchemaDefinitionProperty<string, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    title?: import("mongoose").SchemaDefinitionProperty<string, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    category?: import("mongoose").SchemaDefinitionProperty<string, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    eventDate?: import("mongoose").SchemaDefinitionProperty<Date, TimelineEvent, Document<unknown, {}, TimelineEvent, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TimelineEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, TimelineEvent>;
