import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { ContestType } from './contest.type.js';
export declare class ContestsConnection {
    items: ContestType[];
    meta: PaginationMeta;
}
