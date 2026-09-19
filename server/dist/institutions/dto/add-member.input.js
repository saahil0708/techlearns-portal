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
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
const INSTITUTION_ROLES = [Role.INSTITUTION_ADMIN, Role.FACULTY, Role.STUDENT];
let AddInstitutionMemberInput = class AddInstitutionMemberInput {
    userId;
    role = Role.STUDENT;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], AddInstitutionMemberInput.prototype, "userId", void 0);
__decorate([
    Field(() => Role, { defaultValue: Role.STUDENT }),
    IsEnum(INSTITUTION_ROLES),
    __metadata("design:type", Object)
], AddInstitutionMemberInput.prototype, "role", void 0);
AddInstitutionMemberInput = __decorate([
    InputType('AddInstitutionMemberInput')
], AddInstitutionMemberInput);
export { AddInstitutionMemberInput };
//# sourceMappingURL=add-member.input.js.map