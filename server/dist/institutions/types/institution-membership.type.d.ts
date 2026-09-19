import { Role } from '@prisma/client';
export declare class InstitutionMembershipUserType {
    id: string;
    name: string;
    email: string;
    department?: string;
}
export declare class InstitutionMembershipType {
    id: string;
    institutionId: string;
    role: Role;
    user?: InstitutionMembershipUserType;
}
