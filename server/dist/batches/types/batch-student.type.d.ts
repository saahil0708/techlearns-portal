import { UserType } from '../../users/types/user.type.js';
export declare class BatchStudentType {
    id: string;
    batchId: string;
    userId: string;
    rollNo?: string;
    enrolledAt: Date;
    user?: UserType;
}
