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
import { ProgrammingLanguage, SubmissionStatus, SubmissionVerdict } from '@prisma/client';
import { ProblemType } from '../../problems/types/problem.type.js';
import { UserType } from '../../users/types/user.type.js';
let SubmissionType = class SubmissionType {
    id;
    userId;
    problemId;
    contestId;
    language;
    sourceCode;
    status;
    verdict;
    runtime;
    memory;
    errorMessage;
    passedTestCases;
    totalTestCases;
    user;
    problem;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], SubmissionType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], SubmissionType.prototype, "userId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], SubmissionType.prototype, "problemId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], SubmissionType.prototype, "contestId", void 0);
__decorate([
    Field(() => ProgrammingLanguage),
    __metadata("design:type", String)
], SubmissionType.prototype, "language", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], SubmissionType.prototype, "sourceCode", void 0);
__decorate([
    Field(() => SubmissionStatus),
    __metadata("design:type", String)
], SubmissionType.prototype, "status", void 0);
__decorate([
    Field(() => SubmissionVerdict, { nullable: true }),
    __metadata("design:type", String)
], SubmissionType.prototype, "verdict", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], SubmissionType.prototype, "runtime", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], SubmissionType.prototype, "memory", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], SubmissionType.prototype, "errorMessage", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], SubmissionType.prototype, "passedTestCases", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], SubmissionType.prototype, "totalTestCases", void 0);
__decorate([
    Field(() => UserType, { nullable: true }),
    __metadata("design:type", UserType)
], SubmissionType.prototype, "user", void 0);
__decorate([
    Field(() => ProblemType, { nullable: true }),
    __metadata("design:type", ProblemType)
], SubmissionType.prototype, "problem", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], SubmissionType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], SubmissionType.prototype, "updatedAt", void 0);
SubmissionType = __decorate([
    ObjectType('Submission')
], SubmissionType);
export { SubmissionType };
//# sourceMappingURL=submission.type.js.map