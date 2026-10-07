export interface TestCaseItem {
  id: string;
  order: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden: boolean;
  points: number;
}

export interface ProblemSubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  institution: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error';
  language: string;
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet: string;
}

export interface ProblemCohortItem {
  id: string;
  cohortName: string;
  collegeName: string;
  assignedDate: string;
  studentsAttempted: number;
  totalStudents: number;
  avgAccuracy: string;
  status: 'Mandatory' | 'Optional' | 'Contest Problem';
}

export type SolutionLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'typescript';

export interface CustomSolution {
  displayLang: string;
  filename: string;
  code: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  approachTitle?: string;
  editorialNotes?: string;
  uploadedAt?: string;
}
