var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProblemType } from '../../problems/types/problem.type.js';
let ContestProblemType = class ContestProblemType {
    id;
    contestId;
    problemId;
    points;
    order;
    problem;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], ContestProblemType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestProblemType.prototype, "contestId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestProblemType.prototype, "problemId", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ContestProblemType.prototype, "points", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ContestProblemType.prototype, "order", void 0);
__decorate([
    Field(() => ProblemType, { nullable: true }),
    __metadata("design:type", ProblemType)
], ContestProblemType.prototype, "problem", void 0);
ContestProblemType = __decorate([
    ObjectType('ContestProblem')
], ContestProblemType);
export { ContestProblemType };
//# sourceMappingURL=contest-problem.type.js.map