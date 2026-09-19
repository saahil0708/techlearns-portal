import { CourseStatus } from '@prisma/client';
export declare class CreateCourseDto {
    title: string;
    description?: string;
    institutionId?: string;
    collegeId?: string;
    status?: CourseStatus;
}
