import { LessonType } from './lesson.type.js';
export declare class ModuleType {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    lessons?: LessonType[];
    createdAt: Date;
    updatedAt: Date;
}
