declare const INSTITUTION_ROLES: readonly ["INSTITUTION_ADMIN", "FACULTY", "STUDENT"];
export declare class AddMemberDto {
    userId: string;
    role: (typeof INSTITUTION_ROLES)[number];
}
export {};
