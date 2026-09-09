import { Role } from '@prisma/client';

export interface CollegeMembershipPayload {
  collegeId: string;
  role: Role;
}

export interface CurrentUserPayload {
  id: string;
  email: string;
  name: string;
  globalRole: Role;
  memberships: CollegeMembershipPayload[];
}
