import { UserStatus } from '@prisma/client';
declare const USER_GLOBAL_ROLES: readonly ["SUPER_ADMIN", "PLATFORM_ADMIN", "INSTITUTION_ADMIN", "FACULTY", "STUDENT"];
export declare class CreateUserInput {
    email: string;
    password: string;
    name: string;
    globalRole?: (typeof USER_GLOBAL_ROLES)[number];
    status?: UserStatus;
    institutionId?: string;
    collegeId?: string;
    rollNo?: string;
    handle?: string;
    username?: string;
}
export {};
