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
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
export class BulkInviteItemDto {
    email;
    name;
    role = Role.STUDENT;
    institutionId;
    collegeId;
    batchId;
    rollNo;
}
__decorate([
    ApiProperty({
        example: 'student@example.com',
        description: 'Email address of the invitee',
    }),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    IsNotEmpty({ message: 'Email is required' }),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "email", void 0);
__decorate([
    ApiProperty({
        example: 'John Smith',
        description: 'Full name of the invitee',
    }),
    IsString(),
    IsNotEmpty({ message: 'Name is required' }),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({
        enum: Role,
        default: Role.STUDENT,
        description: 'Role to assign to the invited user',
    }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'inst_123',
        description: 'Target Institution ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "institutionId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'inst_123',
        description: 'Legacy alias for institutionId',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "collegeId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'batch_456',
        description: 'Target Batch/Cohort ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "batchId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'CS2026-001',
        description: 'Student Roll Number / Identity Code',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemDto.prototype, "rollNo", void 0);
export class BulkInviteDto {
    users;
}
__decorate([
    ApiProperty({
        type: [BulkInviteItemDto],
        description: 'Array of user invitations to dispatch',
    }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => BulkInviteItemDto),
    __metadata("design:type", Array)
], BulkInviteDto.prototype, "users", void 0);
//# sourceMappingURL=bulk-invite.dto.js.map