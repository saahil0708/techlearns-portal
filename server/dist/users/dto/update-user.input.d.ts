import { Role, UserStatus } from '@prisma/client';
export declare class UpdateUserInput {
    email?: string;
    name?: string;
    password?: string;
    globalRole?: Role;
    status?: UserStatus;
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
    handle?: string;
    username?: string;
    contestRating?: number;
    ratingTier?: string;
}
