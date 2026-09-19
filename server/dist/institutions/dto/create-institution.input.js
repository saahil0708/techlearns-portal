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
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
let CreateInstitutionInput = class CreateInstitutionInput {
    name;
    code;
    email;
    phone;
    address;
    tier;
    quota;
    status = InstitutionStatus.ACTIVE;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "name", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "code", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "email", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "address", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "tier", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateInstitutionInput.prototype, "quota", void 0);
__decorate([
    Field(() => InstitutionStatus, { defaultValue: InstitutionStatus.ACTIVE, nullable: true }),
    IsOptional(),
    IsEnum(InstitutionStatus),
    __metadata("design:type", String)
], CreateInstitutionInput.prototype, "status", void 0);
CreateInstitutionInput = __decorate([
    InputType('CreateInstitutionInput')
], CreateInstitutionInput);
export { CreateInstitutionInput };
//# sourceMappingURL=create-institution.input.js.map