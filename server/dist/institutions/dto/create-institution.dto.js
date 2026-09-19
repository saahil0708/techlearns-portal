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
import { InstitutionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
export class CreateInstitutionDto {
    name;
    code;
    email;
    phone;
    address;
    tier;
    quota;
    status;
}
__decorate([
    ApiProperty({
        example: 'Massachusetts Institute of Technology',
        description: 'Name of the institution or university',
    }),
    IsString(),
    IsNotEmpty({ message: 'Institution name is required' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "name", void 0);
__decorate([
    ApiProperty({
        example: 'MIT',
        description: 'Unique uppercase institution identifier code',
    }),
    IsString(),
    IsNotEmpty({ message: 'Institution code is required' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "code", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'contact@mit.edu',
        description: 'Official contact email',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({
        example: '+1-617-253-1000',
        description: 'Official contact phone number',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({
        example: '77 Massachusetts Ave, Cambridge, MA 02139',
        description: 'Campus address',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "address", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Enterprise Tier',
        description: 'Subscription tier of the institution',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "tier", void 0);
__decorate([
    ApiPropertyOptional({
        example: 1000,
        description: 'Maximum student seat quota',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateInstitutionDto.prototype, "quota", void 0);
__decorate([
    ApiPropertyOptional({
        enum: InstitutionStatus,
        default: InstitutionStatus.ACTIVE,
    }),
    IsOptional(),
    IsEnum(InstitutionStatus),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "status", void 0);
//# sourceMappingURL=create-institution.dto.js.map