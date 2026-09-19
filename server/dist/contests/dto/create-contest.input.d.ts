import { ContestStatus } from '@prisma/client';
export declare class CreateContestInput {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    institutionId?: string;
    collegeId?: string;
    status?: ContestStatus;
}
