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
import { CourseStatus } from '@prisma/client';
import { ModuleType } from './module.type.js';
let CourseCountsType = class CourseCountsType {
    modules;
    enrollments;
};
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], CourseCountsType.prototype, "modules", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], CourseCountsType.prototype, "enrollments", void 0);
CourseCountsType = __decorate([
    ObjectType('CourseCounts')
], CourseCountsType);
export { CourseCountsType };
let CourseType = class CourseType {
    id;
    title;
    description;
    institutionId;
    collegeId;
    createdById;
    status;
    modules;
    _count;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], CourseType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], CourseType.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], CourseType.prototype, "description", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], CourseType.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], CourseType.prototype, "collegeId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], CourseType.prototype, "createdById", void 0);
__decorate([
    Field(() => CourseStatus),
    __metadata("design:type", String)
], CourseType.prototype, "status", void 0);
__decorate([
    Field(() => [ModuleType], { nullable: true }),
    __metadata("design:type", Array)
], CourseType.prototype, "modules", void 0);
__decorate([
    Field(() => CourseCountsType, { nullable: true }),
    __metadata("design:type", CourseCountsType)
], CourseType.prototype, "_count", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], CourseType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], CourseType.prototype, "updatedAt", void 0);
CourseType = __decorate([
    ObjectType('Course')
], CourseType);
export { CourseType };
//# sourceMappingURL=course.type.js.map