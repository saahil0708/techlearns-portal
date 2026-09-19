import { CourseStatus } from '@prisma/client';
import { ModuleType } from './module.type.js';
export declare class CourseCountsType {
    modules: number;
    enrollments: number;
}
export declare class CourseType {
    id: string;
    title: string;
    description?: string;
    institutionId?: string;
    collegeId?: string;
    createdById: string;
    status: CourseStatus;
    modules?: ModuleType[];
    _count?: CourseCountsType;
    createdAt: Date;
    updatedAt: Date;
}
