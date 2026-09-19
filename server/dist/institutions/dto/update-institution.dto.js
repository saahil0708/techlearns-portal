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
import { InstitutionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
export class UpdateInstitutionDto {
    name;
    email;
    phone;
    address;
    tier;
    quota;
    status;
}
__decorate([
    ApiPropertyOptional({
        example: 'MIT School of Engineering',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'info@mit.edu',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({
        example: '+1-617-253-1000',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Cambridge, MA',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "address", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Enterprise Tier',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "tier", void 0);
__decorate([
    ApiPropertyOptional({
        example: 1000,
    }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateInstitutionDto.prototype, "quota", void 0);
__decorate([
    ApiPropertyOptional({
        enum: InstitutionStatus,
    }),
    IsOptional(),
    IsEnum(InstitutionStatus),
    __metadata("design:type", String)
], UpdateInstitutionDto.prototype, "status", void 0);
//# sourceMappingURL=update-institution.dto.js.map