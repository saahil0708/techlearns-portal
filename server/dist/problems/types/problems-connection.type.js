var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { ProblemType } from './problem.type.js';
let ProblemsConnection = class ProblemsConnection {
    items;
    meta;
};
__decorate([
    Field(() => [ProblemType]),
    __metadata("design:type", Array)
], ProblemsConnection.prototype, "items", void 0);
__decorate([
    Field(() => PaginationMeta),
    __metadata("design:type", PaginationMeta)
], ProblemsConnection.prototype, "meta", void 0);
ProblemsConnection = __decorate([
    ObjectType('ProblemsConnection')
], ProblemsConnection);
export { ProblemsConnection };
//# sourceMappingURL=problems-connection.type.js.map