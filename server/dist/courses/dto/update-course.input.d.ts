import { CourseStatus } from '@prisma/client';
export declare class UpdateCourseInput {
    title?: string;
    description?: string;
    status?: CourseStatus;
}
