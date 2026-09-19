import { CourseStatus } from '@prisma/client';
export declare class CreateCourseInput {
    title: string;
    description?: string;
    institutionId?: string;
    collegeId?: string;
    status?: CourseStatus;
}
