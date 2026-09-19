import { Role, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    globalRole?: Role;
    status?: UserStatus;
    institutionId?: string;
    collegeId?: string;
    rollNo?: string;
    handle?: string;
    username?: string;
}
