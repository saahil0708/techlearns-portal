import { Role } from '@prisma/client';
export interface InstitutionMembershipPayload {
    institutionId: string;
    role: Role;
}
export type CollegeMembershipPayload = InstitutionMembershipPayload;
export interface CurrentUserPayload {
    id: string;
    email: string;
    name: string;
    globalRole: Role;
    memberships: InstitutionMembershipPayload[];
}
