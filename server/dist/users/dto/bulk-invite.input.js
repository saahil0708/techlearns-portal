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
import { Role } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
const USER_GLOBAL_ROLES = [
    Role.SUPER_ADMIN,
    Role.PLATFORM_ADMIN,
    Role.INSTITUTION_ADMIN,
    Role.FACULTY,
    Role.STUDENT,
];
let BulkInviteItemInput = class BulkInviteItemInput {
    email;
    name;
    role = Role.STUDENT;
    institutionId;
    collegeId;
    batchId;
    rollNo;
};
__decorate([
    Field(() => String),
    IsEmail(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "email", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "name", void 0);
__decorate([
    Field(() => Role, { defaultValue: Role.STUDENT }),
    IsEnum(USER_GLOBAL_ROLES),
    __metadata("design:type", Object)
], BulkInviteItemInput.prototype, "role", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "batchId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BulkInviteItemInput.prototype, "rollNo", void 0);
BulkInviteItemInput = __decorate([
    InputType('BulkInviteItemInput')
], BulkInviteItemInput);
export { BulkInviteItemInput };
let BulkInviteUsersInput = class BulkInviteUsersInput {
    users;
};
__decorate([
    Field(() => [BulkInviteItemInput]),
    IsArray(),
    __metadata("design:type", Array)
], BulkInviteUsersInput.prototype, "users", void 0);
BulkInviteUsersInput = __decorate([
    InputType('BulkInviteUsersInput')
], BulkInviteUsersInput);
export { BulkInviteUsersInput };
//# sourceMappingURL=bulk-invite.input.js.map