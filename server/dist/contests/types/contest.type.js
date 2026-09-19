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
import { ContestStatus } from '@prisma/client';
import { ContestProblemType } from './contest-problem.type.js';
import { ContestRegistrationType } from './contest-registration.type.js';
let ContestCountsType = class ContestCountsType {
    problems;
    registrations;
    submissions;
};
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ContestCountsType.prototype, "problems", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ContestCountsType.prototype, "registrations", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], ContestCountsType.prototype, "submissions", void 0);
ContestCountsType = __decorate([
    ObjectType('ContestCounts')
], ContestCountsType);
export { ContestCountsType };
let ContestType = class ContestType {
    id;
    title;
    description;
    startTime;
    endTime;
    institutionId;
    collegeId;
    createdById;
    status;
    problems;
    registrations;
    _count;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], ContestType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestType.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ContestType.prototype, "description", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ContestType.prototype, "startTime", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ContestType.prototype, "endTime", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ContestType.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ContestType.prototype, "collegeId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestType.prototype, "createdById", void 0);
__decorate([
    Field(() => ContestStatus),
    __metadata("design:type", String)
], ContestType.prototype, "status", void 0);
__decorate([
    Field(() => [ContestProblemType], { nullable: true }),
    __metadata("design:type", Array)
], ContestType.prototype, "problems", void 0);
__decorate([
    Field(() => [ContestRegistrationType], { nullable: true }),
    __metadata("design:type", Array)
], ContestType.prototype, "registrations", void 0);
__decorate([
    Field(() => ContestCountsType, { nullable: true }),
    __metadata("design:type", ContestCountsType)
], ContestType.prototype, "_count", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ContestType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ContestType.prototype, "updatedAt", void 0);
ContestType = __decorate([
    ObjectType('Contest')
], ContestType);
export { ContestType };
//# sourceMappingURL=contest.type.js.map