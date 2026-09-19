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
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
let UpdateProblemInput = class UpdateProblemInput {
    title;
    statement;
    inputFormat;
    outputFormat;
    constraints;
    difficulty;
    timeLimit;
    memoryLimit;
    status;
};
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "statement", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "inputFormat", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "outputFormat", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "constraints", void 0);
__decorate([
    Field(() => ProblemDifficulty, { nullable: true }),
    IsOptional(),
    IsEnum(ProblemDifficulty),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "difficulty", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    Min(100),
    Max(10000),
    __metadata("design:type", Number)
], UpdateProblemInput.prototype, "timeLimit", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    Min(16),
    Max(1024),
    __metadata("design:type", Number)
], UpdateProblemInput.prototype, "memoryLimit", void 0);
__decorate([
    Field(() => ProblemStatus, { nullable: true }),
    IsOptional(),
    IsEnum(ProblemStatus),
    __metadata("design:type", String)
], UpdateProblemInput.prototype, "status", void 0);
UpdateProblemInput = __decorate([
    InputType('UpdateProblemInput')
], UpdateProblemInput);
export { UpdateProblemInput };
//# sourceMappingURL=update-problem.input.js.map