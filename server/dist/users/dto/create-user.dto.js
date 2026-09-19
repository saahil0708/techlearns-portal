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
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
    email;
    password;
    name;
    globalRole = Role.STUDENT;
    status = UserStatus.ACTIVE;
    institutionId;
    collegeId;
    rollNo;
    handle;
    username;
}
__decorate([
    ApiProperty({
        example: 'user@example.com',
        description: 'Email address of the user to create',
    }),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    IsNotEmpty({ message: 'Email is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    ApiProperty({
        example: 'Password123!',
        description: 'Initial password for the user (min 8 characters)',
    }),
    IsString(),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    ApiProperty({
        example: 'Jane Doe',
        description: 'Full name of the user',
    }),
    IsString(),
    IsNotEmpty({ message: 'Name is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({
        enum: Role,
        default: Role.STUDENT,
        description: 'Global system role to assign',
    }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], CreateUserDto.prototype, "globalRole", void 0);
__decorate([
    ApiPropertyOptional({
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        description: 'Account activation status',
    }),
    IsOptional(),
    IsEnum(UserStatus),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'cuid1234567890',
        description: 'Associated Institution ID',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "institutionId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'cuid1234567890',
        description: 'Legacy alias for institutionId',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "collegeId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'sedgewick_cs',
        description: 'Unique username / handle / student roll number',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "rollNo", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'sedgewick_cs',
        description: 'Username / handle alias',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "handle", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'sedgewick_cs',
        description: 'Username alias',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
//# sourceMappingURL=create-user.dto.js.map