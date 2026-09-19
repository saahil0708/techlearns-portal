var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
export class CreateBatchDto {
    name;
    institutionId;
    collegeId;
    maxCapacity;
    status;
    startDate;
    endDate;
}
__decorate([
    ApiProperty({
        example: 'CS 2026 Batch A',
        description: 'Name of the cohort or batch',
    }),
    IsString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'inst-uuid-12345',
        description: 'ID of the institution this batch belongs to',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "institutionId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'college-uuid-12345',
        description: 'ID of the institution this batch belongs to (legacy alias)',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "collegeId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 30,
        description: 'Maximum student capacity for this cohort/batch',
    }),
    IsOptional(),
    __metadata("design:type", Number)
], CreateBatchDto.prototype, "maxCapacity", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'ACTIVE',
        description: 'Status of the cohort or batch',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2026-08-01T00:00:00.000Z',
        description: 'Batch start date',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "startDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2027-05-30T00:00:00.000Z',
        description: 'Batch end date',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "endDate", void 0);
//# sourceMappingURL=create-batch.dto.js.map