import { InstitutionStatus } from '@prisma/client';
export declare class UpdateInstitutionDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: InstitutionStatus;
}
