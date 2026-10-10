import type { Metadata } from 'next';
import CoursesDirectoryClient from '@/components/superadmin/courses/CoursesDirectoryClient';
import type { CourseDirectoryEntity } from '@/types/course';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Courses & Interactive Syllabi | TechLearns',
  description: 'Curriculum modules, interactive coding sandboxes, accredited computer science lessons, and progress tracking.',
};

export const dynamic = 'force-dynamic';

/**
 * Courses Directory Page (React Server Component)
 * Dynamically queries live courses from PostgreSQL via NestJS GraphQL API
 */
export default async function CoursesPage() {
  let courses: CourseDirectoryEntity[] = [];

  try {
    const liveData = await apiService.getCourses({ limit: 50 });
    if (liveData?.items && Array.isArray(liveData.items)) {
      courses = liveData.items.map((c: any, idx: number) => ({
        id: c.id,
        code: c.code ?? `CRS-${String(idx + 1).padStart(3, '0')}`,
        slug: c.slug ?? (c.title ? c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `course-${idx + 1}`),
        title: c.title,
        category: (c.category as any) || 'Computer Science & DSA',
        level: (c.level as any) || 'Intermediate',
        instructorName: c.instructor?.name || c.createdBy?.name || 'Faculty Lead',
        instructorTitle: 'Course Instructor',
        institutionName: c.institution?.name || c.college?.name || 'Global Campus',
        durationHours: c.durationHours ?? (c.durationWeeks ? c.durationWeeks * 4 : 36),
        modulesCount: c._count?.modules ?? (Array.isArray(c.modules) ? c.modules.length : 0),
        lessonsCount: Array.isArray(c.modules)
          ? c.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
          : (c._count?.lessons ?? 0),
        enrolledStudents: c._count?.enrollments ?? 0,
        completionRate: c.completionRate ?? 0,
        status: c.status === 'PUBLISHED' ? 'Published' : 'Draft',
        tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : ['Computer Science', 'Programming'],
        description: c.description || 'Comprehensive programming curriculum with hands-on coding challenges.',
        accentColor: ['#0B1F3A', '#7C3AED', '#DC2626', '#059669', '#D97706'][idx % 5],
        modules: c.modules || [],
        moduleHighlights: Array.isArray(c.modules) && c.modules.length > 0
          ? c.modules.map((m: any) => ({
              title: m.title,
              lessons: m.lessons?.length || 0,
            }))
          : [],
      }));
    }
  } catch (err) {
    console.error('Failed to fetch live courses from API:', err);
  }

  return <CoursesDirectoryClient initialCourses={courses} />;
}
