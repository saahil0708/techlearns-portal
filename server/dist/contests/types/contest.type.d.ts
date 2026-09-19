import { ContestStatus } from '@prisma/client';
import { ContestProblemType } from './contest-problem.type.js';
import { ContestRegistrationType } from './contest-registration.type.js';
export declare class ContestCountsType {
    problems: number;
    registrations: number;
    submissions: number;
}
export declare class ContestType {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    institutionId?: string;
    collegeId?: string;
    createdById: string;
    status: ContestStatus;
    problems?: ContestProblemType[];
    registrations?: ContestRegistrationType[];
    _count?: ContestCountsType;
    createdAt: Date;
    updatedAt: Date;
}
