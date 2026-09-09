export interface StudentSubmission {
  id: string;
  problemTitle: string;
  problemSlug: string;
  problemCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet: string;
}

export interface StudentContestHistory {
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

export interface StudentCourseProgress {
  id: string;
  title: string;
  slug: string;
  instructor: string;
  modulesCompleted: number;
  totalModules: number;
  progressPct: number;
  status: 'In Progress' | 'Completed';
}

export interface StudentTopicSkill {
  name: string;
  solved: number;
  total: number;
  pct: number;
}

export interface StudentCertification {
  id: string;
  title: string;
  badgeCode: string;
  language: string;
  stars: number;
  issueDate: string;
  issuer: string;
  credentialId: string;
  skills?: string[];
  certificateUrl?: string;
}

export interface StudentProfileData {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone?: string;
  country?: string;
  countryFlag?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  role: string;
  avatarUrl?: string;
  bannerGradient?: string;
  bio: string;
  institution: string;
  department?: string;
  location: string;
  joinedDate: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
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
  profileCompletionPct?: number;
  certifications?: StudentCertification[];
}
