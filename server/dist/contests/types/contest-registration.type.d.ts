import { UserType } from '../../users/types/user.type.js';
export declare class ContestRegistrationType {
    id: string;
    contestId: string;
    userId: string;
    registeredAt: Date;
    user?: UserType;
}
