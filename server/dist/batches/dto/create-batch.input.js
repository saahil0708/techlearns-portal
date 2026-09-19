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
import { IsDateString, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
let CreateBatchInput = class CreateBatchInput {
    name;
    institutionId;
    collegeId;
    maxCapacity = 100;
    status = 'ACTIVE';
    startDate;
    endDate;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty({ message: 'Batch name is required' }),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "name", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => Int, { nullable: true, defaultValue: 100 }),
    IsOptional(),
    Min(1),
    __metadata("design:type", Number)
], CreateBatchInput.prototype, "maxCapacity", void 0);
__decorate([
    Field(() => String, { nullable: true, defaultValue: 'ACTIVE' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "status", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "startDate", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateBatchInput.prototype, "endDate", void 0);
CreateBatchInput = __decorate([
    InputType('CreateBatchInput')
], CreateBatchInput);
export { CreateBatchInput };
//# sourceMappingURL=create-batch.input.js.map