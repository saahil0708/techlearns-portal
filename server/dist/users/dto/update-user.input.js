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
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
let UpdateUserInput = class UpdateUserInput {
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
};
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "email", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "name", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    MinLength(6),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "password", void 0);
__decorate([
    Field(() => Role, { nullable: true }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "globalRole", void 0);
__decorate([
    Field(() => UserStatus, { nullable: true }),
    IsOptional(),
    IsEnum(UserStatus),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "status", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "avatarUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "bannerUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "bio", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "institution", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "department", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "specialization", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "officeHours", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "location", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "birthDate", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "githubUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "linkedinUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "websiteUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "resumeUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "resumeFileName", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "rollNo", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "handle", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "username", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateUserInput.prototype, "contestRating", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "ratingTier", void 0);
UpdateUserInput = __decorate([
    InputType('UpdateUserInput')
], UpdateUserInput);
export { UpdateUserInput };
//# sourceMappingURL=update-user.input.js.map