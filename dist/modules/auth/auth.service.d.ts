import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
export declare class AuthService {
    private adminService;
    private jwtService;
    constructor(adminService: AdminService, jwtService: JwtService);
    validateAdmin(username: string, pass: string): Promise<any>;
    login(username: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
        };
    }>;
}
