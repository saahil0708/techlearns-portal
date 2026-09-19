/**
 * Secondary Education & School Tenant Data Models & Structures
 */

export interface SchoolEntity {
  id: string;
  name: string;
  code: string;
  domain: string;
  district: string;
  curriculum: string;
  grades: string;
  studentsCount: number;
  maxQuota: number;
  labsCount: number;
  gradeCohortsCount: number;
  teachersCount: number;
  status: 'Active' | 'Suspended';
  logoColor: string;
}

export interface SchoolCohortItem {
  id: string;
  grade: string;
  name: string;
  section: string;
  studentsCount: number;
  maxCapacity: number;
  teacherLead: string;
  labsAssigned: number;
  academicYear: string;
  status: 'Active' | 'Archived';
  avgAccuracy: string;
}

export interface SchoolLabItem {
  id: string;
  code: string;
  title: string;
  gradeLevel: string;
  teacherInstructor: string;
  cohortsAssigned: string[];
  enrolledStudents: number;
  status: 'Published' | 'Draft';
}

export interface SchoolTeacherItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  role: 'Lead CS Teacher' | 'Lab Instructor' | 'Department Head';
  cohortsAssigned: string[];
  activeLabs: number;
}
