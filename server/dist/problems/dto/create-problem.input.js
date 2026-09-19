var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, InputType, Int } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateTestCaseInput } from './create-test-case.input.js';
let CreateProblemInput = class CreateProblemInput {
    title;
    slug;
    statement;
    inputFormat;
    outputFormat;
    constraints;
    difficulty = ProblemDifficulty.MEDIUM;
    timeLimit = 1000;
    memoryLimit = 256;
    institutionId;
    collegeId;
    status = ProblemStatus.PUBLISHED;
    testCases;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "slug", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "statement", void 0);
__decorate([
    Field(() => String, { defaultValue: '' }),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "inputFormat", void 0);
__decorate([
    Field(() => String, { defaultValue: '' }),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "outputFormat", void 0);
__decorate([
    Field(() => String, { defaultValue: '' }),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "constraints", void 0);
__decorate([
    Field(() => ProblemDifficulty, { defaultValue: ProblemDifficulty.MEDIUM }),
    IsEnum(ProblemDifficulty),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "difficulty", void 0);
__decorate([
    Field(() => Int, { defaultValue: 1000 }),
    Min(100),
    Max(10000),
    __metadata("design:type", Number)
], CreateProblemInput.prototype, "timeLimit", void 0);
__decorate([
    Field(() => Int, { defaultValue: 256 }),
    Min(16),
    Max(1024),
    __metadata("design:type", Number)
], CreateProblemInput.prototype, "memoryLimit", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => ProblemStatus, { defaultValue: ProblemStatus.PUBLISHED, nullable: true }),
    IsOptional(),
    IsEnum(ProblemStatus),
    __metadata("design:type", String)
], CreateProblemInput.prototype, "status", void 0);
__decorate([
    Field(() => [CreateTestCaseInput], { nullable: true }),
    IsOptional(),
    IsArray(),
    __metadata("design:type", Array)
], CreateProblemInput.prototype, "testCases", void 0);
CreateProblemInput = __decorate([
    InputType('CreateProblemInput')
], CreateProblemInput);
export { CreateProblemInput };
//# sourceMappingURL=create-problem.input.js.map