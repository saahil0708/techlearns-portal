import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { UserType } from './user.type.js';
export declare class UsersConnection {
    items: UserType[];
    meta: PaginationMeta;
}
