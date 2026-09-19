import { ContestStatus } from '@prisma/client';
export declare class UpdateContestInput {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    status?: ContestStatus;
}
