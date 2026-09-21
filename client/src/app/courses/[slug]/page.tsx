import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/mock-courses-data';
import { apiService } from '@/lib/api-service';
import { CourseDirectoryEntity } from '@/types/course';
import CourseLearningWorkspace from '@/components/courses/CourseLearningWorkspace';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function resolveCourse(slug: string): Promise<CourseDirectoryEntity | null> {
  try {
    const liveCourse = await apiService.getCourseById(slug);
    if (liveCourse && liveCourse.id) {
      return {
        id: liveCourse.id,
        code: liveCourse.code || `CRS-${liveCourse.id.slice(0, 4).toUpperCase()}`,
        slug: liveCourse.slug || slug,
        title: liveCourse.title,
        category: liveCourse.category || 'Computer Science & DSA',
        level: liveCourse.level || 'Intermediate',
        instructorName: liveCourse.instructorName || liveCourse.instructor?.name || 'Academic Faculty',
        instructorTitle: liveCourse.instructorTitle || 'Senior Faculty Lead',
        institutionName: liveCourse.institutionName || liveCourse.institution?.name || 'Academic Institution',
        durationHours: liveCourse.durationHours ?? 40,
        modulesCount: liveCourse.modules?.length ?? liveCourse._count?.modules ?? 6,
        lessonsCount: 24,
        enrolledStudents: liveCourse.enrolledStudents ?? liveCourse._count?.enrollments ?? 120,
        completionRate: liveCourse.completionRate ?? 75,
        status: liveCourse.status === 'DRAFT' ? 'Draft' : 'Published',
        tags: Array.isArray(liveCourse.tags) ? liveCourse.tags : ['Curriculum', 'Computer Science'],
        description: liveCourse.description || 'Comprehensive interactive curriculum covering core fundamentals and hands-on projects.',
        accentColor: liveCourse.accentColor || '#2563EB',
        moduleHighlights: Array.isArray(liveCourse.moduleHighlights) && liveCourse.moduleHighlights.length > 0
          ? liveCourse.moduleHighlights
          : [
              { title: 'Core Foundations & Principles', lessons: 4 },
              { title: 'Data Structures & Algorithmic Patterns', lessons: 4 },
              { title: 'Advanced Problem Solving & Optimization', lessons: 4 },
            ],
      };
    }
  } catch {
    // Fallback to mock
  }

  return getCourseBySlug(slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await resolveCourse(slug);

  if (!course) {
    return {
      title: 'Course Not Found | CodePlatform',
    };
  }

  return {
    title: `${course.title} | CodePlatform Learning Portal`,
    description: `Interactive curriculum for ${course.title} with lesson materials, practice coding sandbox, and real-time progress.`,
  };
}

export default async function CourseLearningPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await resolveCourse(slug);

  if (!course) {
    notFound();
  }

  return <CourseLearningWorkspace course={course} />;
}
