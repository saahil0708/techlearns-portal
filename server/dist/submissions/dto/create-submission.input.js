var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, InputType } from '@nestjs/graphql';
import { ProgrammingLanguage } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
let CreateSubmissionInput = class CreateSubmissionInput {
    problemId;
    contestId;
    language;
    sourceCode;
};
__decorate([
    Field(() => ID),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateSubmissionInput.prototype, "problemId", void 0);
__decorate([
    Field(() => ID, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateSubmissionInput.prototype, "contestId", void 0);
__decorate([
    Field(() => ProgrammingLanguage),
    IsEnum(ProgrammingLanguage),
    __metadata("design:type", String)
], CreateSubmissionInput.prototype, "language", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateSubmissionInput.prototype, "sourceCode", void 0);
CreateSubmissionInput = __decorate([
    InputType('CreateSubmissionInput')
], CreateSubmissionInput);
export { CreateSubmissionInput };
//# sourceMappingURL=create-submission.input.js.map