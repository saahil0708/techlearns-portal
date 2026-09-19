import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { CourseType } from './course.type.js';
export declare class CoursesConnection {
    items: CourseType[];
    meta: PaginationMeta;
}
