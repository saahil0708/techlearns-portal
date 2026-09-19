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
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
let UpdateContestInput = class UpdateContestInput {
    title;
    description;
    startTime;
    endTime;
    status;
};
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateContestInput.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateContestInput.prototype, "description", void 0);
__decorate([
    Field(() => Date, { nullable: true }),
    IsOptional(),
    IsDate(),
    __metadata("design:type", Date)
], UpdateContestInput.prototype, "startTime", void 0);
__decorate([
    Field(() => Date, { nullable: true }),
    IsOptional(),
    IsDate(),
    __metadata("design:type", Date)
], UpdateContestInput.prototype, "endTime", void 0);
__decorate([
    Field(() => ContestStatus, { nullable: true }),
    IsOptional(),
    IsEnum(ContestStatus),
    __metadata("design:type", String)
], UpdateContestInput.prototype, "status", void 0);
UpdateContestInput = __decorate([
    InputType('UpdateContestInput')
], UpdateContestInput);
export { UpdateContestInput };
//# sourceMappingURL=update-contest.input.js.map