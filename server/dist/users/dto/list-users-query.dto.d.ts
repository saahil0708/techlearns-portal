import { Role, UserStatus } from '@prisma/client';
export declare class ListUsersQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
    institutionId?: string;
    collegeId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
