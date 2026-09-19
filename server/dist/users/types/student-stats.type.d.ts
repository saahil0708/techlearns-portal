export declare class TopicSkillType {
    name: string;
    solved: number;
    total: number;
    pct: number;
}
export declare class StudentSubmissionItemType {
    id: string;
    problemTitle: string;
    problemSlug: string;
    problemCode: string;
    difficulty: string;
    language: string;
    verdict: string;
    runtimeMs?: number;
    memoryKb?: number;
    submittedAt: string;
    codeSnippet?: string;
}
export declare class StudentContestItemType {
    id: string;
    contestName: string;
    contestDate: string;
    rank: number;
    totalParticipants: number;
    score: number;
    penaltyTime: string;
    ratingDelta: number;
    newRating: number;
}
export declare class StudentCourseItemType {
    id: string;
    title: string;
    slug: string;
    instructor: string;
    modulesCompleted: number;
    totalModules: number;
    progressPct: number;
    status: string;
}
export declare class StudentProfileType {
    id: string;
    name: string;
    handle: string;
    email?: string;
    role: string;
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    institution?: string;
    department?: string;
    location?: string;
    phone?: string;
    joinedDate: string;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    contestRating: number;
    ratingTier: string;
    globalRank: number;
    solvedTotal: number;
    solvedEasy: number;
    solvedMedium: number;
    solvedHard: number;
    totalSubmissions: number;
    accuracyRate: string;
    currentStreakDays: number;
    maxStreakDays: number;
    topics: TopicSkillType[];
    submissions: StudentSubmissionItemType[];
    contests: StudentContestItemType[];
    courses: StudentCourseItemType[];
}
