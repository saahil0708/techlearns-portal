declare const USER_GLOBAL_ROLES: readonly ["SUPER_ADMIN", "PLATFORM_ADMIN", "INSTITUTION_ADMIN", "FACULTY", "STUDENT"];
export declare class BulkInviteItemInput {
    email: string;
    name: string;
    role: (typeof USER_GLOBAL_ROLES)[number];
    institutionId?: string;
    collegeId?: string;
    batchId?: string;
    rollNo?: string;
}
export declare class BulkInviteUsersInput {
    users: BulkInviteItemInput[];
}
export {};
