import { Document } from 'mongoose';
export declare class Broadcast extends Document {
    text: string;
    mediaType?: string;
    mediaUrl?: string;
    inlineButtons?: Array<{
        text: string;
        url: string;
    }>;
    targetFilter: string;
    sentCount: number;
    failedCount: number;
    status: string;
}
export declare const BroadcastSchema: import("mongoose").Schema<Broadcast, import("mongoose").Model<Broadcast, any, any, any, any, any, Broadcast>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Broadcast, Document<unknown, {}, Broadcast, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    text?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    status?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    mediaType?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    mediaUrl?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    inlineButtons?: import("mongoose").SchemaDefinitionProperty<{
        text: string;
        url: string;
    }[], Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    targetFilter?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sentCount?: import("mongoose").SchemaDefinitionProperty<number, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    failedCount?: import("mongoose").SchemaDefinitionProperty<number, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Broadcast>;
