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
import { InstitutionStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
let UpdateInstitutionInput = class UpdateInstitutionInput {
    name;
    code;
    email;
    phone;
    address;
    tier;
    quota;
    status;
};
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "name", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "code", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "email", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "address", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "tier", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateInstitutionInput.prototype, "quota", void 0);
__decorate([
    Field(() => InstitutionStatus, { nullable: true }),
    IsOptional(),
    IsEnum(InstitutionStatus),
    __metadata("design:type", String)
], UpdateInstitutionInput.prototype, "status", void 0);
UpdateInstitutionInput = __decorate([
    InputType('UpdateInstitutionInput')
], UpdateInstitutionInput);
export { UpdateInstitutionInput };
//# sourceMappingURL=update-institution.input.js.map