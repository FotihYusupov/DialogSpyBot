import { Document } from 'mongoose';
export declare class KnowledgeFact extends Document {
    ownerId: number;
    contactId: string;
    chatId?: number;
    type: string;
    value: string;
    confidence: number;
    sourceMessageId?: string | number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const KnowledgeFactSchema: import("mongoose").Schema<KnowledgeFact, import("mongoose").Model<KnowledgeFact, any, any, any, any, any, KnowledgeFact>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    type?: import("mongoose").SchemaDefinitionProperty<string, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    value?: import("mongoose").SchemaDefinitionProperty<string, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    ownerId?: import("mongoose").SchemaDefinitionProperty<number, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    contactId?: import("mongoose").SchemaDefinitionProperty<string, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chatId?: import("mongoose").SchemaDefinitionProperty<number, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    confidence?: import("mongoose").SchemaDefinitionProperty<number, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    sourceMessageId?: import("mongoose").SchemaDefinitionProperty<string | number, KnowledgeFact, Document<unknown, {}, KnowledgeFact, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeFact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, KnowledgeFact>;
