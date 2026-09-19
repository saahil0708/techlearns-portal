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
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateUserDto {
    email;
    name;
    password;
    globalRole;
    status;
    avatarUrl;
    bannerUrl;
    bio;
    phone;
    institution;
    department;
    specialization;
    officeHours;
    location;
    birthDate;
    githubUrl;
    linkedinUrl;
    websiteUrl;
    resumeUrl;
    resumeFileName;
    rollNo;
    handle;
    username;
    contestRating;
    ratingTier;
}
__decorate([
    ApiPropertyOptional({ example: 'new.email@example.com' }),
    IsOptional(),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Jane Smith' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'NewPassword123!' }),
    IsOptional(),
    IsString(),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ enum: Role }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "globalRole", void 0);
__decorate([
    ApiPropertyOptional({ enum: UserStatus }),
    IsOptional(),
    IsEnum(UserStatus),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatarUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://example.com/banner.jpg' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "bannerUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Passionate software engineer and educator.' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "bio", void 0);
__decorate([
    ApiPropertyOptional({ example: '+1 (555) 019-2834' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Stanford University' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "institution", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Computer Science' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "department", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Algorithms & Data Structures' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "specialization", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mon/Wed 2:00 PM - 4:00 PM' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "officeHours", void 0);
__decorate([
    ApiPropertyOptional({ example: 'San Francisco, CA' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "location", void 0);
__decorate([
    ApiPropertyOptional({ example: '1998-05-15' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "birthDate", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://github.com/username' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "githubUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://linkedin.com/in/username' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "linkedinUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://janesmith.dev' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "websiteUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://example.com/resume.pdf' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "resumeUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Jane_Smith_Resume.pdf' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "resumeFileName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'CS-2026-042' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "rollNo", void 0);
__decorate([
    ApiPropertyOptional({ example: 'janesmith_dev' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "handle", void 0);
__decorate([
    ApiPropertyOptional({ example: 'janesmith_dev' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "username", void 0);
__decorate([
    ApiPropertyOptional({ example: 1650 }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "contestRating", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Specialist' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "ratingTier", void 0);
//# sourceMappingURL=update-user.dto.js.map