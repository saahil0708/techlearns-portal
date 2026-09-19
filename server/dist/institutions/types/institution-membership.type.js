var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
let InstitutionMembershipUserType = class InstitutionMembershipUserType {
    id;
    name;
    email;
    department;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], InstitutionMembershipUserType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InstitutionMembershipUserType.prototype, "name", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InstitutionMembershipUserType.prototype, "email", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], InstitutionMembershipUserType.prototype, "department", void 0);
InstitutionMembershipUserType = __decorate([
    ObjectType('InstitutionMembershipUser')
], InstitutionMembershipUserType);
export { InstitutionMembershipUserType };
let InstitutionMembershipType = class InstitutionMembershipType {
    id;
    institutionId;
    role;
    user;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], InstitutionMembershipType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InstitutionMembershipType.prototype, "institutionId", void 0);
__decorate([
    Field(() => Role),
    __metadata("design:type", String)
], InstitutionMembershipType.prototype, "role", void 0);
__decorate([
    Field(() => InstitutionMembershipUserType, { nullable: true }),
    __metadata("design:type", InstitutionMembershipUserType)
], InstitutionMembershipType.prototype, "user", void 0);
InstitutionMembershipType = __decorate([
    ObjectType('InstitutionMembership')
], InstitutionMembershipType);
export { InstitutionMembershipType };
//# sourceMappingURL=institution-membership.type.js.map