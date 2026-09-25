export interface CourseTool {
  name: string;
  iconTag: string;
  category: string;
}

export interface CurriculumPhase {
  durationWeeks: string;
  title: string;
  summary: string;
  topics: string[];
  handsOnLab: string;
  projectDeliverable: string;
}

export interface CurriculumTrackModule {
  moduleNumber: number;
  title: string;
  badge: 'Common Module' | 'Specialization Module' | 'Capstone Module' | string;
  topics: string[];
}

export interface CurriculumTrack {
  id: string;
  label: string;
  icon: string;
  modules: CurriculumTrackModule[];
}

export interface CourseProject {
  title: string;
  tagline: string;
  description: string;
  techStack: string[];
  image: string;
  metric: string;
  repoHash?: string;
}

export interface CourseInstructor {
  name: string;
  role: string;
  company: string;
  avatar: string;
  experience: string;
  bio?: string;
}

export interface CareerOutcomes {
  topRoles: string[];
  avgSalary: string;
  highestSalary: string;
  hiringCompanies: string[];
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseProgram {
  slug: string;
  category: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: string;
  enrolledCount: string;
  salaryHike: string;
  nextCohortDate: string;
  duration: string;
  effort: string;
  level: string;
  price: string;
  emi: string;
  heroImage: string;
  tools: CourseTool[];
  pedagogyMix: {
    theory: number;
    practice: number;
    exposure: number;
  };
  curriculum: CurriculumPhase[];
  curriculumTracks: CurriculumTrack[];
  projects: CourseProject[];
  instructors: CourseInstructor[];
  externalCertifications: string[];
  careerOutcomes: CareerOutcomes;
  faqs: CourseFaq[];
}
