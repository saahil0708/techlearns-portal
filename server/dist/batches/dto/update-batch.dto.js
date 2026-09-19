var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
export class UpdateBatchDto {
    name;
    maxCapacity;
    startDate;
    endDate;
    status;
}
__decorate([
    ApiPropertyOptional({
        example: 'CS 2026 Batch A (Updated)',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBatchDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({
        example: 30,
    }),
    IsOptional(),
    __metadata("design:type", Number)
], UpdateBatchDto.prototype, "maxCapacity", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2026-08-01T00:00:00.000Z',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateBatchDto.prototype, "startDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2027-05-30T00:00:00.000Z',
    }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateBatchDto.prototype, "endDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'ACTIVE',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBatchDto.prototype, "status", void 0);
//# sourceMappingURL=update-batch.dto.js.map