declare const INSTITUTION_ROLES: readonly ["INSTITUTION_ADMIN", "FACULTY", "STUDENT"];
export declare class AddInstitutionMemberInput {
    userId: string;
    role: (typeof INSTITUTION_ROLES)[number];
}
export {};
