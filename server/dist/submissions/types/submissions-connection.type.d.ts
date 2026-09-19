import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { SubmissionType } from './submission.type.js';
export declare class SubmissionsConnection {
    items: SubmissionType[];
    meta: PaginationMeta;
}
