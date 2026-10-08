export interface BatchItem {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  maxCapacity: number;
  facultyLead: string;
  faculty?: Array<{ id?: string; userId?: string; user?: { id: string; name: string; email?: string; department?: string; avatarUrl?: string }; role?: string }>;
  facultyIds?: string[];
  coursesAssigned: number;
  year: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  avgAccuracy: string;
}

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  batch: string;
  problemsSolved: number;
  totalSubmissions: number;
  accuracy: string;
  activeStreak: number;
  lastActive: string;
  status: 'Active' | 'At Risk' | 'Inactive';
}

export interface FacultyItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Dean' | 'HOD' | 'Professor' | 'Lab Assistant';
  activeBatches: number;
  problemsCreated: number;
  joinedDate: string;
  status: 'Active' | 'Invited';
}

export interface CourseAssignmentItem {
  id: string;
  title: string;
  code: string;
  category: string;
  level: string;
  enrolledStudents: number;
  completionRate: number;
  assignedBatches: string[];
}
