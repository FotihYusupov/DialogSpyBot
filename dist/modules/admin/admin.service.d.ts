import { Model } from 'mongoose';
import { Admin } from './schemas/admin.schema';
export declare class AdminService {
    private adminModel;
    constructor(adminModel: Model<Admin>);
    findByUsername(username: string): Promise<Admin | null>;
    createAdmin(username: string, passwordPlain: string, role?: string): Promise<Admin>;
    changePassword(username: string, newPasswordPlain: string): Promise<Admin | null>;
    removeAdmin(username: string): Promise<any>;
}
