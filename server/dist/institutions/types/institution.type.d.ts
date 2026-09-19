import { InstitutionStatus } from '@prisma/client';
import { InstitutionCountsType } from './institution-counts.type.js';
import { InstitutionMembershipType } from './institution-membership.type.js';
export declare class InstitutionType {
    id: string;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status: InstitutionStatus;
    createdAt: Date;
    updatedAt: Date;
    _count?: InstitutionCountsType;
    memberships?: InstitutionMembershipType[];
}
