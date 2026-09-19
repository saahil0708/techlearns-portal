/**
 * Courses & Curriculum Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import {
  COURSES_QUERY,
  COURSE_BY_ID_QUERY,
  CREATE_COURSE_MUTATION,
  UPDATE_COURSE_MUTATION,
  DELETE_COURSE_MUTATION,
  fetchGraphQL,
} from '@/lib/graphql';

export interface LessonEntity {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  problemId?: string;
  isCompleted?: boolean;
}

export interface ModuleEntity {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonEntity[];
}

export interface CourseEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  level: string;
  authorId?: string;
  collegeId?: string;
  modulesCount?: number;
  enrolledStudentsCount?: number;
  modules?: ModuleEntity[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

export async function getCoursesApi(params?: { page?: number; limit?: number; search?: string; level?: string; status?: string }) {
  try {
    const data = await deduplicatedQuery<{ courses: { items: any[]; meta: any } }>(
      COURSES_QUERY,
      params || {},
    );
    return data.courses;
  } catch (err) {
    console.warn('API getCourses fallback:', err);
    return null;
  }
}

export async function getCourseBySlugApi(slug: string) {
  const data = await fetchGraphQL<{ course: any }>(COURSE_BY_ID_QUERY, { id: slug });
  return data.course;
}

export async function createCourseApi(input: {
  title: string;
  slug?: string;
  description?: string;
  level?: string;
  collegeId?: string;
  status?: string;
}) {
  const data = await fetchGraphQL<{ createCourse: any }>(CREATE_COURSE_MUTATION, { input });
  return data.createCourse;
}

export async function updateCourseApi(id: string, input: {
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  status?: string;
}) {
  const data = await fetchGraphQL<{ updateCourse: any }>(UPDATE_COURSE_MUTATION, { id, input });
  return data.updateCourse;
}

export async function deleteCourseApi(id: string) {
  const data = await fetchGraphQL<{ deleteCourse: boolean }>(DELETE_COURSE_MUTATION, { id });
  return data.deleteCourse;
}
