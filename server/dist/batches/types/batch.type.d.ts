import { InstitutionType } from '../../institutions/types/institution.type.js';
import { BatchCountsType } from './batch-counts.type.js';
import { BatchStudentType } from './batch-student.type.js';
export declare class BatchType {
    id: string;
    name: string;
    institutionId: string;
    collegeId?: string;
    maxCapacity: number;
    status: string;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    institution?: InstitutionType;
    students?: BatchStudentType[];
    _count?: BatchCountsType;
}
