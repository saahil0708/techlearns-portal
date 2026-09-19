import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { InstitutionType } from './institution.type.js';
export declare class InstitutionsConnection {
    items: InstitutionType[];
    meta: PaginationMeta;
}
