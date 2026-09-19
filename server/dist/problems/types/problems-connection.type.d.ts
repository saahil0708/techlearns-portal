import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { ProblemType } from './problem.type.js';
export declare class ProblemsConnection {
    items: ProblemType[];
    meta: PaginationMeta;
}
