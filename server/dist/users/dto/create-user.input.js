var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, InputType } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
const USER_GLOBAL_ROLES = [
    Role.SUPER_ADMIN,
    Role.PLATFORM_ADMIN,
    Role.INSTITUTION_ADMIN,
    Role.FACULTY,
    Role.STUDENT,
];
let CreateUserInput = class CreateUserInput {
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
};
__decorate([
    Field(() => String),
    IsEmail(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "email", void 0);
__decorate([
    Field(() => String),
    IsString(),
    MinLength(8),
    __metadata("design:type", String)
], CreateUserInput.prototype, "password", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "name", void 0);
__decorate([
    Field(() => Role, { defaultValue: Role.STUDENT, nullable: true }),
    IsOptional(),
    IsEnum(USER_GLOBAL_ROLES),
    __metadata("design:type", Object)
], CreateUserInput.prototype, "globalRole", void 0);
__decorate([
    Field(() => UserStatus, { defaultValue: UserStatus.ACTIVE, nullable: true }),
    IsOptional(),
    IsEnum(UserStatus),
    __metadata("design:type", String)
], CreateUserInput.prototype, "status", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "rollNo", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "handle", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateUserInput.prototype, "username", void 0);
CreateUserInput = __decorate([
    InputType('CreateUserInput')
], CreateUserInput);
export { CreateUserInput };
//# sourceMappingURL=create-user.input.js.map