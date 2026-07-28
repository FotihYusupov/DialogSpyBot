import { Document } from 'mongoose';
export declare class SystemLog extends Document {
    type: string;
    message: string;
    stack?: string;
    meta?: Record<string, any>;
}
export declare const SystemLogSchema: import("mongoose").Schema<SystemLog, import("mongoose").Model<SystemLog, any, any, any, any, any, SystemLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SystemLog, Document<unknown, {}, SystemLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, SystemLog, Document<unknown, {}, SystemLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    type?: import("mongoose").SchemaDefinitionProperty<string, SystemLog, Document<unknown, {}, SystemLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    message?: import("mongoose").SchemaDefinitionProperty<string, SystemLog, Document<unknown, {}, SystemLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    stack?: import("mongoose").SchemaDefinitionProperty<string, SystemLog, Document<unknown, {}, SystemLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    meta?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, SystemLog, Document<unknown, {}, SystemLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SystemLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, SystemLog>;
