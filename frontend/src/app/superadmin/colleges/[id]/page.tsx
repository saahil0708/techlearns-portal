import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollegeDetailClient, {
  BatchItem,
  StudentRosterItem,
  CourseAssignmentItem,
  FacultyCoordinatorItem,
} from '@/components/superadmin/colleges/CollegeDetailClient';
import { CollegeEntity } from '@/components/superadmin/colleges/CollegesDirectoryClient';

// Seed Colleges Database
const ALL_COLLEGES: CollegeEntity[] = [
  {
    id: 'col-1',
    name: 'Stanford University - Dept of CS',
    code: 'STAN-CS',
    domain: 'stanford.edu',
    region: 'North America',
    tier: 'Enterprise Tier',
    studentsCount: 3120,
    maxQuota: 4000,
    coursesCount: 22,
    cohortsCount: 8,
    facultyCount: 14,
    status: 'Active',
    logoColor: '#EF4444',
  },
  {
    id: 'col-2',
    name: 'Massachusetts Inst of Technology (MIT)',
    code: 'MIT-EECS',
    domain: 'mit.edu',
    region: 'North America',
    tier: 'Enterprise Tier',
    studentsCount: 4280,
    maxQuota: 5000,
    coursesCount: 26,
    cohortsCount: 12,
    facultyCount: 20,
    status: 'Active',
    logoColor: '#3B82F6',
  },
  {
    id: 'col-3',
    name: 'IIT Delhi - Dept of Comp Science',
    code: 'IITD-CS',
    domain: 'iitd.ac.in',
    region: 'Asia-Pacific',
    tier: 'Enterprise Tier',
    studentsCount: 3840,
    maxQuota: 4500,
    coursesCount: 18,
    cohortsCount: 9,
    facultyCount: 16,
    status: 'Active',
    logoColor: '#10B981',
  },
  {
    id: 'col-4',
    name: 'Oxford Computing Faculty',
    code: 'OXF-CS',
    domain: 'ox.ac.uk',
    region: 'Europe',
    tier: 'Pro Academic',
    studentsCount: 2950,
    maxQuota: 3500,
    coursesCount: 16,
    cohortsCount: 7,
    facultyCount: 12,
    status: 'Active',
    logoColor: '#8B5CF6',
  },
  {
    id: 'col-5',
    name: 'Carnegie Mellon University - SCS',
    code: 'CMU-SCS',
    domain: 'cmu.edu',
    region: 'North America',
    tier: 'Enterprise Tier',
    studentsCount: 3600,
    maxQuota: 4000,
    coursesCount: 24,
    cohortsCount: 10,
    facultyCount: 18,
    status: 'Active',
    logoColor: '#DC2626',
  },
  {
    id: 'col-6',
    name: 'National University of Singapore (NUS)',
    code: 'NUS-SOC',
    domain: 'nus.edu.sg',
    region: 'Asia-Pacific',
    tier: 'Pro Academic',
    studentsCount: 2800,
    maxQuota: 3500,
    coursesCount: 15,
    cohortsCount: 6,
    facultyCount: 11,
    status: 'Active',
    logoColor: '#F59E0B',
  },
  {
    id: 'col-7',
    name: 'UC Berkeley - EECS Department',
    code: 'UCB-EECS',
    domain: 'berkeley.edu',
    region: 'North America',
    tier: 'Enterprise Tier',
    studentsCount: 3950,
    maxQuota: 4500,
    coursesCount: 20,
    cohortsCount: 9,
    facultyCount: 15,
    status: 'Active',
    logoColor: '#2563EB',
  },
  {
    id: 'col-8',
    name: 'ETH Zurich Computer Science',
    code: 'ETHZ-CS',
    domain: 'ethz.ch',
    region: 'Europe',
    tier: 'Pro Academic',
    studentsCount: 2400,
    maxQuota: 3000,
    coursesCount: 14,
    cohortsCount: 6,
    facultyCount: 10,
    status: 'Active',
    logoColor: '#059669',
  },
  {
    id: 'col-9',
    name: 'IIT Bombay - CSE Dept',
    code: 'IITB-CSE',
    domain: 'iitb.ac.in',
    region: 'Asia-Pacific',
    tier: 'Enterprise Tier',
    studentsCount: 4100,
    maxQuota: 4500,
    coursesCount: 21,
    cohortsCount: 10,
    facultyCount: 17,
    status: 'Active',
    logoColor: '#D97706',
  },
];

// Mock Batches
const MOCK_BATCHES: BatchItem[] = [
  {
    id: 'b-1',
    name: 'Batch 2026 - CS Alpha (Core DS&A)',
    code: 'CS-2026-ALPHA',
    studentsCount: 148,
    maxCapacity: 160,
    facultyLead: 'Prof. David Patterson',
    coursesAssigned: 4,
    year: '2026',
    status: 'Active',
    avgAccuracy: '76.4%',
  },
  {
    id: 'b-2',
    name: 'Batch 2026 - AI & Systems Track',
    code: 'AI-2026-SYS',
    studentsCount: 132,
    maxCapacity: 150,
    facultyLead: 'Dr. Fei-Fei Li',
    coursesAssigned: 3,
    year: '2026',
    status: 'Active',
    avgAccuracy: '81.2%',
  },
  {
    id: 'b-3',
    name: 'Batch 2027 - Accelerated Algorithms',
    code: 'ALGO-2027-FAST',
    studentsCount: 110,
    maxCapacity: 120,
    facultyLead: 'Dr. John Ousterhout',
    coursesAssigned: 4,
    year: '2027',
    status: 'Active',
    avgAccuracy: '88.5%',
  },
  {
    id: 'b-4',
    name: 'Batch 2027 - Web & Distributed Systems',
    code: 'DIST-2027-B',
    studentsCount: 95,
    maxCapacity: 120,
    facultyLead: 'Dr. Dan Boneh',
    coursesAssigned: 3,
    year: '2027',
    status: 'Active',
    avgAccuracy: '69.8%',
  },
];

// Mock Students Roster
const MOCK_STUDENTS: StudentRosterItem[] = [
  {
    id: 'st-1',
    name: 'Liam Vance',
    rollNo: 'ST-CS-2026-001',
    email: 'lvance@stanford.edu',
    batch: 'Batch 2026 - CS Alpha (Core DS&A)',
    problemsSolved: 482,
    accuracy: '86.4%',
    streakDays: 42,
    rank: 1,
    status: 'Active',
  },
  {
    id: 'st-2',
    name: 'Maya Lin',
    rollNo: 'ST-CS-2026-004',
    email: 'mlin@stanford.edu',
    batch: 'Batch 2026 - CS Alpha (Core DS&A)',
    problemsSolved: 440,
    accuracy: '82.1%',
    streakDays: 38,
    rank: 2,
    status: 'Active',
  },
  {
    id: 'st-3',
    name: 'Priya Sharma',
    rollNo: 'ST-AI-2026-012',
    email: 'psharma@stanford.edu',
    batch: 'Batch 2026 - AI & Systems Track',
    problemsSolved: 412,
    accuracy: '79.5%',
    streakDays: 29,
    rank: 3,
    status: 'Active',
  },
  {
    id: 'st-4',
    name: 'Alex Rivera',
    rollNo: 'ST-ALGO-2027-008',
    email: 'arivera@stanford.edu',
    batch: 'Batch 2027 - Accelerated Algorithms',
    problemsSolved: 390,
    accuracy: '88.2%',
    streakDays: 24,
    rank: 4,
    status: 'Active',
  },
  {
    id: 'st-5',
    name: 'Kenji Sato',
    rollNo: 'ST-DIST-2027-019',
    email: 'ksato@stanford.edu',
    batch: 'Batch 2027 - Web & Distributed Systems',
    problemsSolved: 345,
    accuracy: '74.6%',
    streakDays: 18,
    rank: 5,
    status: 'Active',
  },
  {
    id: 'st-6',
    name: 'Sophia Miller',
    rollNo: 'ST-AI-2026-022',
    email: 'smiller@stanford.edu',
    batch: 'Batch 2026 - AI & Systems Track',
    problemsSolved: 310,
    accuracy: '81.4%',
    streakDays: 15,
    rank: 6,
    status: 'Active',
  },
];

// Mock Courses
const MOCK_COURSES: CourseAssignmentItem[] = [
  {
    id: 'crs-1',
    title: 'Data Structures & Algorithms Mastery in C++',
    code: 'CS-106B',
    level: 'Intermediate',
    modulesCount: 14,
    enrolledStudents: 312,
    completionRate: '78.5%',
    facultyInstructor: 'Prof. David Patterson',
  },
  {
    id: 'crs-2',
    title: 'Advanced Operating & Distributed Systems',
    code: 'CS-240',
    level: 'Advanced',
    modulesCount: 18,
    enrolledStudents: 240,
    completionRate: '64.2%',
    facultyInstructor: 'Dr. John Ousterhout',
  },
  {
    id: 'crs-3',
    title: 'Introduction to Machine Learning & Deep Neural Nets',
    code: 'CS-229',
    level: 'Intermediate',
    modulesCount: 16,
    enrolledStudents: 380,
    completionRate: '82.0%',
    facultyInstructor: 'Dr. Fei-Fei Li',
  },
  {
    id: 'crs-4',
    title: 'Cryptographic Protocols & Computer Security',
    code: 'CS-255',
    level: 'Advanced',
    modulesCount: 12,
    enrolledStudents: 195,
    completionRate: '71.4%',
    facultyInstructor: 'Dr. Dan Boneh',
  },
];

// Mock Faculty
const MOCK_FACULTY: FacultyCoordinatorItem[] = [
  {
    id: 'fac-1',
    name: 'Prof. David Patterson',
    email: 'patterson@stanford.edu',
    department: 'Computer Systems & Architecture',
    role: 'Department Head',
    batchesAssigned: ['Batch 2026 - CS Alpha (Core DS&A)'],
    activeCourses: 3,
  },
  {
    id: 'fac-2',
    name: 'Dr. Fei-Fei Li',
    email: 'feifeili@stanford.edu',
    department: 'Artificial Intelligence Lab',
    role: 'Senior Mentor',
    batchesAssigned: ['Batch 2026 - AI & Systems Track'],
    activeCourses: 2,
  },
  {
    id: 'fac-3',
    name: 'Dr. John Ousterhout',
    email: 'ousterhout@stanford.edu',
    department: 'Software Systems Lab',
    role: 'Senior Mentor',
    batchesAssigned: ['Batch 2027 - Accelerated Algorithms'],
    activeCourses: 2,
  },
  {
    id: 'fac-4',
    name: 'Dr. Dan Boneh',
    email: 'dabo@cs.stanford.edu',
    department: 'Security & Applied Crypto',
    role: 'Lab Instructor',
    batchesAssigned: ['Batch 2027 - Web & Distributed Systems'],
    activeCourses: 2,
  },
];

import { apiService } from '@/lib/api-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let collegeName = 'College Workspace';
  let collegeCode = 'CAMPUS';
  try {
    const liveData = await apiService.getColleges({ limit: 50 });
    const match = liveData?.items?.find((c: any) => c.id === id);
    if (match) {
      collegeName = match.name;
      collegeCode = match.code;
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${collegeName} (${collegeCode}) | CodePlatform Academic Workspace`,
    description: `Multi-tenant academic workspace for ${collegeName}. Manage cohorts, faculty, and student rosters.`,
  };
}

/**
 * Individual College Academic Portal (React Server Component)
 */
export default async function CollegeDetailPage({ params }: PageProps) {
  const { id } = await params;
  let college: CollegeEntity | undefined = undefined;

  try {
    const liveCollege = await apiService.getCollegeById(id);
    if (liveCollege?.id) {
      college = {
        id: liveCollege.id,
        name: liveCollege.name,
        code: liveCollege.code,
        domain: liveCollege.email && liveCollege.email.includes('@') ? liveCollege.email.split('@')[1] : `${liveCollege.code.toLowerCase()}.edu`,
        region: liveCollege.address || 'Global',
        tier: 'Enterprise Tier',
        studentsCount: liveCollege._count?.memberships || 0,
        maxQuota: 5000,
        coursesCount: liveCollege._count?.courses || 0,
        cohortsCount: liveCollege._count?.batches || 0,
        facultyCount: 5,
        status: liveCollege.status === 'ACTIVE' ? 'Active' : 'Suspended',
        logoColor: '#3B82F6',
      };
    }
  } catch (err) {
    console.warn('Live college detail fetch fallback:', err);
  }

  if (!college) {
    college = ALL_COLLEGES.find((c) => c.id === id) || ALL_COLLEGES[0];
  }

  return (
    <CollegeDetailClient
      college={college}
      initialBatches={MOCK_BATCHES}
      initialStudents={MOCK_STUDENTS}
      initialCourses={MOCK_COURSES}
      initialFaculty={MOCK_FACULTY}
    />
  );
}
