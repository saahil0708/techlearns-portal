import { CourseStatus } from '@prisma/client';
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    status?: CourseStatus;
}
