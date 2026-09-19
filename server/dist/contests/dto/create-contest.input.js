var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, InputType } from '@nestjs/graphql';
import { ContestStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
let CreateContestInput = class CreateContestInput {
    title;
    description;
    startTime;
    endTime;
    institutionId;
    collegeId;
    status = ContestStatus.UPCOMING;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateContestInput.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateContestInput.prototype, "description", void 0);
__decorate([
    Field(() => Date),
    IsDate(),
    __metadata("design:type", Date)
], CreateContestInput.prototype, "startTime", void 0);
__decorate([
    Field(() => Date),
    IsDate(),
    __metadata("design:type", Date)
], CreateContestInput.prototype, "endTime", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateContestInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateContestInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => ContestStatus, { defaultValue: ContestStatus.UPCOMING, nullable: true }),
    IsOptional(),
    IsEnum(ContestStatus),
    __metadata("design:type", String)
], CreateContestInput.prototype, "status", void 0);
CreateContestInput = __decorate([
    InputType('CreateContestInput')
], CreateContestInput);
export { CreateContestInput };
//# sourceMappingURL=create-contest.input.js.map