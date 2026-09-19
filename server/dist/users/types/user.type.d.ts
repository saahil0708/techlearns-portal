import { Role, UserStatus } from '@prisma/client';
export declare class UserInstitutionMembershipInstitutionType {
    id: string;
    name: string;
    code?: string;
}
export declare class UserInstitutionMembershipType {
    id: string;
    institutionId: string;
    role: Role;
    institution?: UserInstitutionMembershipInstitutionType;
}
export declare class UserBatchEnrollmentBatchType {
    id: string;
    name: string;
    code?: string;
}
export declare class UserBatchEnrollmentType {
    id: string;
    batchId: string;
    rollNo?: string;
    batch?: UserBatchEnrollmentBatchType;
}
export declare class UserType {
    id: string;
    email: string;
    name: string;
    globalRole: Role;
    status: UserStatus;
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    phone?: string;
    institution?: string;
    department?: string;
    specialization?: string;
    officeHours?: string;
    location?: string;
    birthDate?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    rollNo?: string;
    contestRating: number;
    ratingTier: string;
    memberships?: UserInstitutionMembershipType[];
    batchEnrollments?: UserBatchEnrollmentType[];
    createdAt: Date;
    updatedAt: Date;
}
