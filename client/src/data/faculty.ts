/**
 * Faculty Domain Data Models & Structures
 * Centralized data contracts for College Faculty, Mentors, and Academic Instructors.
 */

export interface FacultyProfileEntity {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  officeHours: string;
  location: string;
  phone: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  roleTitle: string;
  collegeName: string;
  collegeCode: string;
  collegeDomain: string;
  twoFactorEnabled: boolean;
}

export interface FacultyBatchItem {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  maxCapacity: number;
  year: string;
  avgAccuracy: string;
  coursesAssigned: number;
  status: string;
}

export interface FacultyCourseItem {
  id: string;
  code: string;
  title: string;
  level: string;
  modulesCount: number;
  enrolledStudents: number;
  status: string;
}

export const initialFacultyProfile: FacultyProfileEntity = {
  id: '',
  name: 'Faculty Mentor',
  email: '',
  department: '',
  specialization: '',
  officeHours: '',
  location: '',
  phone: '',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  websiteUrl: '',
  roleTitle: 'Faculty Mentor',
  collegeName: '',
  collegeCode: '',
  collegeDomain: '',
  twoFactorEnabled: false,
};

export const sampleFacultyBatches: FacultyBatchItem[] = [
  {
    id: 'batch-uniques-3',
    name: 'Uniques 3.0',
    code: 'SVIET-UNIQ',
    studentsCount: 30,
    maxCapacity: 30,
    year: '2026–2027',
    avgAccuracy: '91.2%',
    coursesAssigned: 3,
    status: 'Active',
  },
];

export const sampleFacultyCourses: FacultyCourseItem[] = [
  {
    id: 'course-dsa',
    code: 'CS-301',
    title: 'Advanced Data Structures & Algorithms Lab',
    level: 'Advanced',
    modulesCount: 8,
    enrolledStudents: 30,
    status: 'Active',
  },
  {
    id: 'course-fullstack',
    code: 'CS-402',
    title: 'Full-Stack Distributed Systems Engineering',
    level: 'Intermediate',
    modulesCount: 6,
    enrolledStudents: 28,
    status: 'Active',
  },
];
