import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { BatchType } from './batch.type.js';
export declare class BatchesConnection {
    items: BatchType[];
    meta: PaginationMeta;
}
