import { Model } from 'mongoose';
import { Reminder } from './schemas/reminder.schema';
export interface ParsedReminder {
    remindAt: Date | null;
    text: string;
    error?: string;
}
export declare class RemindersService {
    private reminderModel;
    private readonly logger;
    constructor(reminderModel: Model<Reminder>);
    parseReminderText(input: string): ParsedReminder;
    create(ownerId: number, text: string, remindAt: Date): Promise<Reminder>;
    findActiveByOwner(ownerId: number): Promise<Reminder[]>;
    findDueReminders(): Promise<Reminder[]>;
    markSent(reminderId: string): Promise<void>;
    cancel(reminderId: string, ownerId: number): Promise<boolean>;
    countActiveByOwner(ownerId: number): Promise<number>;
}
