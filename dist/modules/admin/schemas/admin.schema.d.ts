import { Document } from 'mongoose';
export declare class Admin extends Document {
    username: string;
    passwordHash: string;
    role: string;
}
export declare const AdminSchema: import("mongoose").Schema<Admin, import("mongoose").Model<Admin, any, any, any, any, any, Admin>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Admin, Document<unknown, {}, Admin, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Admin & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Admin, Document<unknown, {}, Admin, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    username?: import("mongoose").SchemaDefinitionProperty<string, Admin, Document<unknown, {}, Admin, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    passwordHash?: import("mongoose").SchemaDefinitionProperty<string, Admin, Document<unknown, {}, Admin, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    role?: import("mongoose").SchemaDefinitionProperty<string, Admin, Document<unknown, {}, Admin, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Admin>;
