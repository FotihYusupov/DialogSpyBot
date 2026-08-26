import { Document } from 'mongoose';
export declare class InterestScore extends Document {
    ownerId: number;
    contactId: string;
    topic: string;
    score: number;
    lastDiscussedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InterestScoreSchema: import("mongoose").Schema<InterestScore, import("mongoose").Model<InterestScore, any, any, any, any, any, InterestScore>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InterestScore, Document<unknown, {}, InterestScore, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    score?: import("mongoose").SchemaDefinitionProperty<number, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    ownerId?: import("mongoose").SchemaDefinitionProperty<number, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    contactId?: import("mongoose").SchemaDefinitionProperty<string, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    topic?: import("mongoose").SchemaDefinitionProperty<string, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    lastDiscussedAt?: import("mongoose").SchemaDefinitionProperty<Date, InterestScore, Document<unknown, {}, InterestScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InterestScore & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, InterestScore>;
