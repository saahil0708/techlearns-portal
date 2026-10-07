import type { CourseDirectoryEntity, CourseCategory } from '@/types/course';

export interface EnrolledStudent {
  id: string;
  name: string;
  handle: string;
  institution: string;
  enrolledDate: string;
  progressPct: number;
  completedLessons: number;
  quizScorePct: number;
  lastActive: string;
  status: 'In Progress' | 'Completed' | 'Inactive';
}

export interface CourseAssignment {
  id: string;
  title: string;
  module: string;
  type: 'Coding Lab' | 'Quiz' | 'Project Evaluation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissionsCount: number;
  avgScore: number;
  dueDate: string;
  status: 'Open' | 'Graded';
}

export interface SubModuleProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  testCasesCount: number;
  tags?: string[];
}

export interface TopicItem {
  id?: string;
  title: string;
  type: 'guide' | 'lab' | 'reading' | 'quiz';
  duration: string;
  summary?: string;
  problemTag?: string;
  importantNotes?: string[];
  problems?: SubModuleProblem[];
  codingProblem?: any;
  quizMCQ?: any;
  quizAttempt?: any;
  codeSubmission?: any;
  userProgress?: any;
  content?: string;
  isCompleted?: boolean;
}

export interface CourseDetailClientProps {
  course: CourseDirectoryEntity;
  role?: 'superadmin' | 'student';
}
