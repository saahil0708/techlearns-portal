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
import { Role, UserStatus } from '@prisma/client';
let UserInstitutionMembershipInstitutionType = class UserInstitutionMembershipInstitutionType {
    id;
    name;
    code;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], UserInstitutionMembershipInstitutionType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserInstitutionMembershipInstitutionType.prototype, "name", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserInstitutionMembershipInstitutionType.prototype, "code", void 0);
UserInstitutionMembershipInstitutionType = __decorate([
    ObjectType('UserInstitutionMembershipInstitution')
], UserInstitutionMembershipInstitutionType);
export { UserInstitutionMembershipInstitutionType };
let UserInstitutionMembershipType = class UserInstitutionMembershipType {
    id;
    institutionId;
    role;
    institution;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], UserInstitutionMembershipType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserInstitutionMembershipType.prototype, "institutionId", void 0);
__decorate([
    Field(() => Role),
    __metadata("design:type", String)
], UserInstitutionMembershipType.prototype, "role", void 0);
__decorate([
    Field(() => UserInstitutionMembershipInstitutionType, { nullable: true }),
    __metadata("design:type", UserInstitutionMembershipInstitutionType)
], UserInstitutionMembershipType.prototype, "institution", void 0);
UserInstitutionMembershipType = __decorate([
    ObjectType('UserInstitutionMembership')
], UserInstitutionMembershipType);
export { UserInstitutionMembershipType };
let UserBatchEnrollmentBatchType = class UserBatchEnrollmentBatchType {
    id;
    name;
    code;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], UserBatchEnrollmentBatchType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserBatchEnrollmentBatchType.prototype, "name", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBatchEnrollmentBatchType.prototype, "code", void 0);
UserBatchEnrollmentBatchType = __decorate([
    ObjectType('UserBatchEnrollmentBatch')
], UserBatchEnrollmentBatchType);
export { UserBatchEnrollmentBatchType };
let UserBatchEnrollmentType = class UserBatchEnrollmentType {
    id;
    batchId;
    rollNo;
    batch;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], UserBatchEnrollmentType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserBatchEnrollmentType.prototype, "batchId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBatchEnrollmentType.prototype, "rollNo", void 0);
__decorate([
    Field(() => UserBatchEnrollmentBatchType, { nullable: true }),
    __metadata("design:type", UserBatchEnrollmentBatchType)
], UserBatchEnrollmentType.prototype, "batch", void 0);
UserBatchEnrollmentType = __decorate([
    ObjectType('UserBatchEnrollment')
], UserBatchEnrollmentType);
export { UserBatchEnrollmentType };
let UserType = class UserType {
    id;
    email;
    name;
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
    contestRating;
    ratingTier;
    memberships;
    batchEnrollments;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], UserType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserType.prototype, "email", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], UserType.prototype, "name", void 0);
__decorate([
    Field(() => Role),
    __metadata("design:type", String)
], UserType.prototype, "globalRole", void 0);
__decorate([
    Field(() => UserStatus),
    __metadata("design:type", String)
], UserType.prototype, "status", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "avatarUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "bannerUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "bio", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "institution", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "department", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "specialization", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "officeHours", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "location", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "birthDate", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "githubUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "linkedinUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "websiteUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "resumeUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "resumeFileName", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "rollNo", void 0);
__decorate([
    Field(() => Int, { defaultValue: 1500 }),
    __metadata("design:type", Number)
], UserType.prototype, "contestRating", void 0);
__decorate([
    Field(() => String, { defaultValue: 'Novice' }),
    __metadata("design:type", String)
], UserType.prototype, "ratingTier", void 0);
__decorate([
    Field(() => [UserInstitutionMembershipType], { nullable: true }),
    __metadata("design:type", Array)
], UserType.prototype, "memberships", void 0);
__decorate([
    Field(() => [UserBatchEnrollmentType], { nullable: true }),
    __metadata("design:type", Array)
], UserType.prototype, "batchEnrollments", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
UserType = __decorate([
    ObjectType('User')
], UserType);
export { UserType };
//# sourceMappingURL=user.type.js.map