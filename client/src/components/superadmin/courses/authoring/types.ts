export type LessonModality = 'reading' | 'quiz' | 'msq' | 'code';

export interface LessonAuthoringPayload {
  title: string;
  type: LessonModality;
  durationMinutes: number;
  content: string;
  importantNotes?: string[];
  quizMCQ?: {
    question: string;
    options: string[];
    correctIndex?: number;
    correctIndices?: number[];
    isMSQ?: boolean;
    explanation?: string;
    hint?: string;
    points?: number;
  };
  codingProblem?: {
    title?: string;
    statement?: string;
    description?: string;
    language?: string;
    starterCode?: string;
    sampleInput?: string;
    sampleOutput?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  };
}

export interface LessonAuthoringModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LessonAuthoringPayload) => Promise<void> | void;
  initialData?: any;
  isEditing?: boolean;
  moduleTitle?: string;
}

export interface TestCaseItem {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}
