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
import { IsDateString, IsOptional, IsString, Min } from 'class-validator';
let UpdateBatchInput = class UpdateBatchInput {
    name;
    maxCapacity;
    status;
    startDate;
    endDate;
};
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBatchInput.prototype, "name", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    Min(1),
    __metadata("design:type", Number)
], UpdateBatchInput.prototype, "maxCapacity", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBatchInput.prototype, "status", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateBatchInput.prototype, "startDate", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateBatchInput.prototype, "endDate", void 0);
UpdateBatchInput = __decorate([
    InputType('UpdateBatchInput')
], UpdateBatchInput);
export { UpdateBatchInput };
//# sourceMappingURL=update-batch.input.js.map