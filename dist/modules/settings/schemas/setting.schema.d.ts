import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class Setting extends Document {
    key: string;
    value: any;
}
export declare const SettingSchema: MongooseSchema<Setting, import("mongoose").Model<Setting, any, any, any, any, any, Setting>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Setting, Document<unknown, {}, Setting, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Setting & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string, Setting, Document<unknown, {}, Setting, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Setting & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Setting, Document<unknown, {}, Setting, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Setting & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    value?: import("mongoose").SchemaDefinitionProperty<any, Setting, Document<unknown, {}, Setting, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Setting & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Setting>;
