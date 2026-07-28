import { Document } from 'mongoose';
export declare class ContactProfile extends Document {
    ownerId: number;
    contactId: string;
    chatId?: number;
    telegramId?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    summary: string;
    facts: string[];
    interests: string[];
    skills: string[];
    companies: string[];
    education: string[];
    phones: string[];
    emails: string[];
    links: string[];
    socialLinks: string[];
    locations: string[];
    languages: string[];
    birthdays: string[];
    importantDates: string[];
    notes: string[];
    country?: string;
    language?: string;
    confidenceScore?: number;
    firstSeen: Date;
    lastSeen: Date;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ContactProfileSchema: import("mongoose").Schema<ContactProfile, import("mongoose").Model<ContactProfile, any, any, any, any, any, ContactProfile>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactProfile, Document<unknown, {}, ContactProfile, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    username?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    ownerId?: import("mongoose").SchemaDefinitionProperty<number, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    contactId?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    chatId?: import("mongoose").SchemaDefinitionProperty<number, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    telegramId?: import("mongoose").SchemaDefinitionProperty<number, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    firstName?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    lastName?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    summary?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    facts?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    interests?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    skills?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    companies?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    education?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    phones?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    emails?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    links?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    socialLinks?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    locations?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    languages?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    birthdays?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    importantDates?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    notes?: import("mongoose").SchemaDefinitionProperty<string[], ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    country?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    language?: import("mongoose").SchemaDefinitionProperty<string, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    confidenceScore?: import("mongoose").SchemaDefinitionProperty<number, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    firstSeen?: import("mongoose").SchemaDefinitionProperty<Date, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    lastSeen?: import("mongoose").SchemaDefinitionProperty<Date, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    lastUpdated?: import("mongoose").SchemaDefinitionProperty<Date, ContactProfile, Document<unknown, {}, ContactProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ContactProfile>;
