var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { InstitutionStatus } from '@prisma/client';
import { InstitutionCountsType } from './institution-counts.type.js';
import { InstitutionMembershipType } from './institution-membership.type.js';
let InstitutionType = class InstitutionType {
    id;
    name;
    code;
    email;
    phone;
    address;
    tier;
    quota;
    status;
    createdAt;
    updatedAt;
    _count;
    memberships;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], InstitutionType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InstitutionType.prototype, "name", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InstitutionType.prototype, "code", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], InstitutionType.prototype, "email", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], InstitutionType.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], InstitutionType.prototype, "address", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], InstitutionType.prototype, "tier", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], InstitutionType.prototype, "quota", void 0);
__decorate([
    Field(() => InstitutionStatus),
    __metadata("design:type", String)
], InstitutionType.prototype, "status", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], InstitutionType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], InstitutionType.prototype, "updatedAt", void 0);
__decorate([
    Field(() => InstitutionCountsType, { nullable: true }),
    __metadata("design:type", InstitutionCountsType)
], InstitutionType.prototype, "_count", void 0);
__decorate([
    Field(() => [InstitutionMembershipType], { nullable: true }),
    __metadata("design:type", Array)
], InstitutionType.prototype, "memberships", void 0);
InstitutionType = __decorate([
    ObjectType('Institution')
], InstitutionType);
export { InstitutionType };
//# sourceMappingURL=institution.type.js.map