export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseCategory =
  | 'Computer Science & DSA'
  | 'System Design & Architecture'
  | 'Web & Full-Stack Development'
  | 'Competitive Programming'
  | 'AI, ML & Data Science';

export interface ModuleHighlight {
  title: string;
  lessons: number;
}

export interface CourseLevelModule {
  id: string;
  title: string;
  subtitle: string;
  problemsCount: number;
  topics: string[];
  status?: 'Not Started' | 'In Progress' | 'Completed';
  linkUrl?: string;
}

export interface CourseLevelTrack {
  levelNumber: number;
  levelTitle: string;
  badgeTagline: string;
  summary: string;
  estimatedWeeks: number;
  modules: CourseLevelModule[];
}

export interface WhatYouWillLearnItem {
  title: string;
  description: string;
}

export interface CourseDirectoryEntity {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar?: string;
  institutionName: string;
  durationHours: number;
  modulesCount: number;
  lessonsCount: number;
  enrolledStudents: number;
  completionRate: number;
  status: 'Published' | 'Draft' | 'Archived';
  tags: string[];
  description: string;
  accentColor: string;
  moduleHighlights: ModuleHighlight[];
  whatYouWillLearn?: WhatYouWillLearnItem[];
  prerequisites?: string[];
  targetRoles?: string[];
  levels?: CourseLevelTrack[];
}

export interface NewCourseData {
  title: string;
  code: string;
  slug: string;
  category: CourseCategory;
  level: CourseLevel;
  instructorName: string;
  instructorTitle: string;
  institutionName: string;
  durationHours: number;
  modulesCount: number;
  lessonsCount: number;
  description: string;
  status: 'Published' | 'Draft';
  tags: string[];
}

