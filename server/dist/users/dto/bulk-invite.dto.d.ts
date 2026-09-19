import { Role } from '@prisma/client';
export declare class BulkInviteItemDto {
    email: string;
    name: string;
    role: Role;
    institutionId?: string;
    collegeId?: string;
    batchId?: string;
    rollNo?: string;
}
export declare class BulkInviteDto {
    users: BulkInviteItemDto[];
}
