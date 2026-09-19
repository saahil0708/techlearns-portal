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
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { TestCaseType } from './test-case.type.js';
let ProblemCountsType = class ProblemCountsType {
    submissions;
    testCases;
};
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ProblemCountsType.prototype, "submissions", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ProblemCountsType.prototype, "testCases", void 0);
ProblemCountsType = __decorate([
    ObjectType('ProblemCounts')
], ProblemCountsType);
export { ProblemCountsType };
let ProblemType = class ProblemType {
    id;
    title;
    slug;
    statement;
    inputFormat;
    outputFormat;
    constraints;
    difficulty;
    timeLimit;
    memoryLimit;
    institutionId;
    collegeId;
    createdById;
    status;
    testCases;
    _count;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], ProblemType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "title", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "slug", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "statement", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "inputFormat", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "outputFormat", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "constraints", void 0);
__decorate([
    Field(() => ProblemDifficulty),
    __metadata("design:type", String)
], ProblemType.prototype, "difficulty", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ProblemType.prototype, "timeLimit", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ProblemType.prototype, "memoryLimit", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ProblemType.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ProblemType.prototype, "collegeId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ProblemType.prototype, "createdById", void 0);
__decorate([
    Field(() => ProblemStatus),
    __metadata("design:type", String)
], ProblemType.prototype, "status", void 0);
__decorate([
    Field(() => [TestCaseType], { nullable: true }),
    __metadata("design:type", Array)
], ProblemType.prototype, "testCases", void 0);
__decorate([
    Field(() => ProblemCountsType, { nullable: true }),
    __metadata("design:type", ProblemCountsType)
], ProblemType.prototype, "_count", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ProblemType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ProblemType.prototype, "updatedAt", void 0);
ProblemType = __decorate([
    ObjectType('Problem')
], ProblemType);
export { ProblemType };
//# sourceMappingURL=problem.type.js.map