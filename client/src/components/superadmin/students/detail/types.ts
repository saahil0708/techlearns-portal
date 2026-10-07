import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';

export interface StudentSubmissionItem {
  id: string;
  problemTitle: string;
  problemCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'C++20' | 'Python 3' | 'Java 21' | 'TypeScript';
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet: string;
}

export interface StudentCourseItem {
  id: string;
  title: string;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  modulesCompleted: number;
  totalModules: number;
  progressPct: number;
  status: 'In Progress' | 'Completed';
}

export interface StudentContestItem {
  id: string;
  contestName: string;
  contestDate: string;
  rank: number;
  totalParticipants: number;
  problemsSolved: number;
  penaltyTime: string;
  ratingDelta: number;
  newRating: number;
}

export interface StudentTopicItem {
  id: string;
  topicName: string;
  solvedCount: number;
  totalAvailable: number;
  accuracy: string;
  levelMastery: 'Master' | 'Proficient' | 'Intermediate' | 'Learning';
}

export interface StudentBadgeItem {
  id: string;
  title: string;
  category: 'Contest Medal' | 'Course Certificate' | 'Milestone';
  issuer: string;
  issueDate: string;
  credentialId: string;
}

export interface StudentDetailClientProps {
  student: StudentDirectoryEntity;
  initialSubmissions: StudentSubmissionItem[];
  initialCourses: StudentCourseItem[];
  initialContests: StudentContestItem[];
  initialTopics: StudentTopicItem[];
  initialBadges: StudentBadgeItem[];
}
