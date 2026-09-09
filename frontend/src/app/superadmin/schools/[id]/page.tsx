import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolDetailClient, {
  GradeCohortItem,
  SchoolStudentItem,
  CodingLabItem,
  SchoolTeacherItem,
} from '@/components/superadmin/schools/SchoolDetailClient';
import { SchoolEntity } from '@/components/superadmin/schools/SchoolsDirectoryClient';

// Seed Schools Database
const ALL_SCHOOLS: SchoolEntity[] = [
  {
    id: 'sch-1',
    name: 'Stuyvesant High School of Science',
    code: 'STUY-NYC',
    domain: 'stuy.edu',
    district: 'New York City District 2',
    curriculum: 'STEM Honors / AP',
    grades: 'Grades 9–12',
    studentsCount: 2840,
    maxQuota: 3300,
    labsCount: 14,
    gradeCohortsCount: 8,
    teachersCount: 12,
    status: 'Active',
    logoColor: '#2563EB',
  },
  {
    id: 'sch-2',
    name: 'Thomas Jefferson High School for Science & Tech',
    code: 'TJHSST-VA',
    domain: 'tjhsst.edu',
    district: 'Fairfax County Public Schools',
    curriculum: 'STEM Honors / AP',
    grades: 'Grades 9–12',
    studentsCount: 1980,
    maxQuota: 2200,
    labsCount: 18,
    gradeCohortsCount: 6,
    teachersCount: 15,
    status: 'Active',
    logoColor: '#DC2626',
  },
  {
    id: 'sch-3',
    name: 'Bronx High School of Science',
    code: 'BXSCI-NY',
    domain: 'bxscience.edu',
    district: 'New York City District 2',
    curriculum: 'Advanced Placement (AP)',
    grades: 'Grades 9–12',
    studentsCount: 2750,
    maxQuota: 3000,
    labsCount: 12,
    gradeCohortsCount: 8,
    teachersCount: 10,
    status: 'Active',
    logoColor: '#059669',
  },
  {
    id: 'sch-4',
    name: 'Phillips Exeter Academy',
    code: 'PEA-NH',
    domain: 'exeter.edu',
    district: 'New England Prep League',
    curriculum: 'IB Diploma Programme',
    grades: 'Grades 9–12',
    studentsCount: 1120,
    maxQuota: 1400,
    labsCount: 9,
    gradeCohortsCount: 4,
    teachersCount: 8,
    status: 'Active',
    logoColor: '#7C3AED',
  },
  {
    id: 'sch-5',
    name: 'Whitney High School',
    code: 'WHIT-CA',
    domain: 'whitneyhs.org',
    district: 'California Unified',
    curriculum: 'STEM Honors / AP',
    grades: 'Grades 7–12',
    studentsCount: 1050,
    maxQuota: 1200,
    labsCount: 8,
    gradeCohortsCount: 6,
    teachersCount: 7,
    status: 'Active',
    logoColor: '#D97706',
  },
  {
    id: 'sch-6',
    name: 'DPS International School',
    code: 'DPSI-ND',
    domain: 'dpsfsis.com',
    district: 'Central Board / International',
    curriculum: 'CBSE / Olympiad Track',
    grades: 'Grades 6–12',
    studentsCount: 2200,
    maxQuota: 2500,
    labsCount: 11,
    gradeCohortsCount: 7,
    teachersCount: 9,
    status: 'Active',
    logoColor: '#0284C7',
  },
  {
    id: 'sch-7',
    name: 'National Public School - Indiranagar',
    code: 'NPS-BLR',
    domain: 'npsinr.com',
    district: 'Central Board / International',
    curriculum: 'CBSE / Olympiad Track',
    grades: 'Grades 8–12',
    studentsCount: 1680,
    maxQuota: 2000,
    labsCount: 7,
    gradeCohortsCount: 5,
    teachersCount: 6,
    status: 'Active',
    logoColor: '#EA580C',
  },
  {
    id: 'sch-8',
    name: 'Eton College Computing Dept',
    code: 'ETON-UK',
    domain: 'etoncollege.org.uk',
    district: 'UK Independent Schools',
    curriculum: 'Cambridge A-Levels',
    grades: 'Senior High (11–12)',
    studentsCount: 980,
    maxQuota: 1200,
    labsCount: 6,
    gradeCohortsCount: 4,
    teachersCount: 5,
    status: 'Active',
    logoColor: '#4338CA',
  },
  {
    id: 'sch-9',
    name: 'Illinois Math and Science Academy',
    code: 'IMSA-IL',
    domain: 'imsa.edu',
    district: 'Fairfax County Public Schools',
    curriculum: 'STEM Honors / AP',
    grades: 'Grades 10–12',
    studentsCount: 650,
    maxQuota: 800,
    labsCount: 8,
    gradeCohortsCount: 3,
    teachersCount: 8,
    status: 'Active',
    logoColor: '#0D9488',
  },
  {
    id: 'sch-10',
    name: 'Singapore American School',
    code: 'SAS-SG',
    domain: 'sas.edu.sg',
    district: 'Central Board / International',
    curriculum: 'Advanced Placement (AP)',
    grades: 'Grades 9–12',
    studentsCount: 1450,
    maxQuota: 1800,
    labsCount: 9,
    gradeCohortsCount: 5,
    teachersCount: 7,
    status: 'Active',
    logoColor: '#E11D48',
  },
];

// Mock Grade Sections / STEM Cohorts
const MOCK_COHORTS: GradeCohortItem[] = [
  {
    id: 'cohort-1',
    name: 'Grade 10 - AP Computer Science A (Section Alpha)',
    code: 'STUY-10A',
    gradeLevel: 'Grade 10',
    studentsCount: 34,
    maxCapacity: 36,
    teacherLead: 'Mr. David Vance',
    labsAssigned: 4,
    status: 'Active',
    avgAccuracy: '88.4%',
  },
  {
    id: 'cohort-2',
    name: 'Grade 11 - Advanced Algorithms & USACO Gold Club',
    code: 'STUY-11-USACO',
    gradeLevel: 'Grade 11',
    studentsCount: 28,
    maxCapacity: 30,
    teacherLead: 'Dr. Rebecca Chen',
    labsAssigned: 6,
    status: 'Active',
    avgAccuracy: '92.1%',
  },
  {
    id: 'cohort-3',
    name: 'Grade 9 - Python & Intro to Problem Solving',
    code: 'STUY-9-PY',
    gradeLevel: 'Grade 9',
    studentsCount: 42,
    maxCapacity: 45,
    teacherLead: 'Ms. Sarah Connor',
    labsAssigned: 3,
    status: 'Active',
    avgAccuracy: '84.6%',
  },
  {
    id: 'cohort-4',
    name: 'Grade 12 - Senior Capstone: Web & Cloud Engineering',
    code: 'STUY-12-CAP',
    gradeLevel: 'Grade 12',
    studentsCount: 30,
    maxCapacity: 35,
    teacherLead: 'Mr. David Vance',
    labsAssigned: 5,
    status: 'Active',
    avgAccuracy: '89.7%',
  },
  {
    id: 'cohort-5',
    name: 'Robotics & Embedded Systems Club',
    code: 'STUY-ROBO',
    gradeLevel: 'STEM Club',
    studentsCount: 25,
    maxCapacity: 30,
    teacherLead: 'Coach Alan Turing',
    labsAssigned: 4,
    status: 'Active',
    avgAccuracy: '86.2%',
  },
  {
    id: 'cohort-6',
    name: 'Girls Who Code & AI Explorers Chapter',
    code: 'STUY-GWC',
    gradeLevel: 'STEM Club',
    studentsCount: 38,
    maxCapacity: 40,
    teacherLead: 'Dr. Rebecca Chen',
    labsAssigned: 3,
    status: 'Active',
    avgAccuracy: '91.0%',
  },
];

// Mock Student Roster Dataset
const MOCK_STUDENTS: SchoolStudentItem[] = [
  {
    id: 'stud-1',
    name: 'Maya Lin',
    studentId: 'STUY-2027-014',
    email: 'm.lin@stuy.edu',
    cohort: 'Grade 11 - Advanced Algorithms & USACO Gold Club',
    gradeLevel: 'Grade 11',
    problemsSolved: 312,
    accuracy: '96.4%',
    streakDays: 48,
    rank: 1,
    status: 'Active',
  },
  {
    id: 'stud-2',
    name: 'Liam Vance',
    studentId: 'STUY-2027-022',
    email: 'l.vance@stuy.edu',
    cohort: 'Grade 11 - Advanced Algorithms & USACO Gold Club',
    gradeLevel: 'Grade 11',
    problemsSolved: 289,
    accuracy: '94.8%',
    streakDays: 42,
    rank: 2,
    status: 'Active',
  },
  {
    id: 'stud-3',
    name: 'Ethan Zhang',
    studentId: 'STUY-2028-005',
    email: 'e.zhang@stuy.edu',
    cohort: 'Grade 10 - AP Computer Science A (Section Alpha)',
    gradeLevel: 'Grade 10',
    problemsSolved: 264,
    accuracy: '93.2%',
    streakDays: 39,
    rank: 3,
    status: 'Active',
  },
  {
    id: 'stud-4',
    name: 'Sophia Williams',
    studentId: 'STUY-2028-041',
    email: 's.williams@stuy.edu',
    cohort: 'Grade 10 - AP Computer Science A (Section Alpha)',
    gradeLevel: 'Grade 10',
    problemsSolved: 245,
    accuracy: '91.5%',
    streakDays: 31,
    rank: 4,
    status: 'Active',
  },
  {
    id: 'stud-5',
    name: 'Alexander Kim',
    studentId: 'STUY-2026-088',
    email: 'a.kim@stuy.edu',
    cohort: 'Grade 12 - Senior Capstone: Web & Cloud Engineering',
    gradeLevel: 'Grade 12',
    problemsSolved: 238,
    accuracy: '90.2%',
    streakDays: 28,
    rank: 5,
    status: 'Active',
  },
  {
    id: 'stud-6',
    name: 'Chloe Patel',
    studentId: 'STUY-2029-012',
    email: 'c.patel@stuy.edu',
    cohort: 'Grade 9 - Python & Intro to Problem Solving',
    gradeLevel: 'Grade 9',
    problemsSolved: 215,
    accuracy: '88.9%',
    streakDays: 22,
    rank: 6,
    status: 'Active',
  },
  {
    id: 'stud-7',
    name: 'Daniel Rivera',
    studentId: 'STUY-2028-067',
    email: 'd.rivera@stuy.edu',
    cohort: 'Grade 10 - AP Computer Science A (Section Alpha)',
    gradeLevel: 'Grade 10',
    problemsSolved: 202,
    accuracy: '87.4%',
    streakDays: 19,
    rank: 7,
    status: 'Active',
  },
  {
    id: 'stud-8',
    name: 'Emma Watson',
    studentId: 'STUY-2029-034',
    email: 'e.watson@stuy.edu',
    cohort: 'Grade 9 - Python & Intro to Problem Solving',
    gradeLevel: 'Grade 9',
    problemsSolved: 194,
    accuracy: '86.1%',
    streakDays: 15,
    rank: 8,
    status: 'Active',
  },
  {
    id: 'stud-9',
    name: 'Lucas Nakamura',
    studentId: 'STUY-2027-055',
    email: 'l.nakamura@stuy.edu',
    cohort: 'Grade 11 - Advanced Algorithms & USACO Gold Club',
    gradeLevel: 'Grade 11',
    problemsSolved: 188,
    accuracy: '89.3%',
    streakDays: 14,
    rank: 9,
    status: 'Active',
  },
  {
    id: 'stud-10',
    name: 'Olivia Martinez',
    studentId: 'STUY-2026-029',
    email: 'o.martinez@stuy.edu',
    cohort: 'Grade 12 - Senior Capstone: Web & Cloud Engineering',
    gradeLevel: 'Grade 12',
    problemsSolved: 176,
    accuracy: '85.7%',
    streakDays: 12,
    rank: 10,
    status: 'Active',
  },
  {
    id: 'stud-11',
    name: 'Noah Goldberg',
    studentId: 'STUY-2028-090',
    email: 'n.goldberg@stuy.edu',
    cohort: 'Grade 10 - AP Computer Science A (Section Alpha)',
    gradeLevel: 'Grade 10',
    problemsSolved: 164,
    accuracy: '84.2%',
    streakDays: 10,
    rank: 11,
    status: 'Active',
  },
  {
    id: 'stud-12',
    name: 'Isabella Rossi',
    studentId: 'STUY-2029-078',
    email: 'i.rossi@stuy.edu',
    cohort: 'Grade 9 - Python & Intro to Problem Solving',
    gradeLevel: 'Grade 9',
    problemsSolved: 152,
    accuracy: '83.5%',
    streakDays: 9,
    rank: 12,
    status: 'Active',
  },
];

// Mock Coding Labs
const MOCK_LABS: CodingLabItem[] = [
  {
    id: 'lab-1',
    title: 'AP Computer Science A - Java Core & OOP Labs',
    code: 'AP-CSA-101',
    level: 'Intermediate',
    modulesCount: 16,
    enrolledStudents: 142,
    completionRate: '88.5%',
    instructor: 'Mr. David Vance',
  },
  {
    id: 'lab-2',
    title: 'Competitive Programming & USACO Bronze to Silver Track',
    code: 'USACO-201',
    level: 'Advanced',
    modulesCount: 22,
    enrolledStudents: 98,
    completionRate: '92.0%',
    instructor: 'Dr. Rebecca Chen',
  },
  {
    id: 'lab-3',
    title: 'Python for Beginners & Interactive Math Games',
    code: 'PY-K12-01',
    level: 'Beginner',
    modulesCount: 12,
    enrolledStudents: 185,
    completionRate: '94.2%',
    instructor: 'Ms. Sarah Connor',
  },
  {
    id: 'lab-4',
    title: 'Web Dev Essentials: HTML, CSS & JavaScript Fundamentals',
    code: 'WEB-101',
    level: 'Beginner',
    modulesCount: 14,
    enrolledStudents: 120,
    completionRate: '86.4%',
    instructor: 'Mr. David Vance',
  },
  {
    id: 'lab-5',
    title: 'Data Structures with C++ for High Schoolers',
    code: 'CPP-DS-202',
    level: 'Intermediate',
    modulesCount: 18,
    enrolledStudents: 85,
    completionRate: '79.8%',
    instructor: 'Dr. Rebecca Chen',
  },
  {
    id: 'lab-6',
    title: 'Robotics Control & Microcontroller Programming',
    code: 'ROBO-301',
    level: 'Advanced',
    modulesCount: 10,
    enrolledStudents: 64,
    completionRate: '82.1%',
    instructor: 'Coach Alan Turing',
  },
];

// Mock CS Teachers
const MOCK_TEACHERS: SchoolTeacherItem[] = [
  {
    id: 'fac-1',
    name: 'Mr. David Vance',
    email: 'd.vance@stuy.edu',
    department: 'Computer Science & Technology',
    role: 'CS Department Lead',
    cohortsAssigned: ['Grade 10 - AP CS A', 'Grade 12 - Capstone'],
    activeLabs: 4,
  },
  {
    id: 'fac-2',
    name: 'Dr. Rebecca Chen',
    email: 'r.chen@stuy.edu',
    department: 'Mathematics & Advanced Computing',
    role: 'AP CS Instructor',
    cohortsAssigned: ['Grade 11 - USACO Club', 'Girls Who Code'],
    activeLabs: 3,
  },
  {
    id: 'fac-3',
    name: 'Ms. Sarah Connor',
    email: 's.connor@stuy.edu',
    department: 'Applied Sciences',
    role: 'STEM Mentor',
    cohortsAssigned: ['Grade 9 - Python Intro'],
    activeLabs: 2,
  },
  {
    id: 'fac-4',
    name: 'Coach Alan Turing',
    email: 'a.turing@stuy.edu',
    department: 'Robotics & Engineering Lab',
    role: 'Robotics Coach',
    cohortsAssigned: ['Robotics & Embedded Systems Club'],
    activeLabs: 2,
  },
];

import { apiService } from '@/lib/api-service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let schoolName = 'School Organization';
  let schoolCode = 'SCH';
  try {
    const liveData = await apiService.getColleges({ limit: 50 });
    const match = liveData?.items?.find((s: any) => s.id === id);
    if (match) {
      schoolName = match.name;
      schoolCode = match.code;
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${schoolName} (${schoolCode}) | CodePlatform Schools`,
    description: `Manage ${schoolName} secondary education cohorts, student roster, coding labs, and CS mentors.`,
  };
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params;
  let school: SchoolEntity | undefined = ALL_SCHOOLS.find((s) => s.id === id);

  if (!school) {
    try {
      const liveData = await apiService.getColleges({ limit: 50 });
      const match = liveData?.items?.find((s: any) => s.id === id);
      if (match) {
        school = {
          id: match.id,
          name: match.name,
          code: match.code,
          domain: match.email && match.email.includes('@') ? match.email.split('@')[1] : `${match.code.toLowerCase()}.edu`,
          district: 'Regional STEM District',
          curriculum: 'STEM Honors / AP',
          grades: 'Grades 9–12',
          studentsCount: match._count?.memberships || 0,
          maxQuota: 3000,
          labsCount: (match._count?.courses || 0) * 2 || 6,
          gradeCohortsCount: match._count?.batches || 4,
          teachersCount: 8,
          status: match.status === 'ACTIVE' ? 'Active' : 'Suspended',
          logoColor: '#2563EB',
        };
      }
    } catch (err) {
      console.warn('Live school detail fetch fallback:', err);
    }
  }

  if (!school) {
    school = ALL_SCHOOLS[0];
  }

  return (
    <SchoolDetailClient
      school={school}
      initialCohorts={MOCK_COHORTS}
      initialStudents={MOCK_STUDENTS}
      initialLabs={MOCK_LABS}
      initialTeachers={MOCK_TEACHERS}
    />
  );
}
