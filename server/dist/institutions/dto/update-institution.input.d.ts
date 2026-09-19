import { InstitutionStatus } from '@prisma/client';
export declare class UpdateInstitutionInput {
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: InstitutionStatus;
}
