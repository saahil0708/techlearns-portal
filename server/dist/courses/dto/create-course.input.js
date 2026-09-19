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
import { CourseStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
let CreateCourseInput = class CreateCourseInput {
    title;
    description;
    institutionId;
    collegeId;
    status = CourseStatus.DRAFT;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "title", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "description", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "collegeId", void 0);
__decorate([
    Field(() => CourseStatus, { defaultValue: CourseStatus.DRAFT, nullable: true }),
    IsOptional(),
    IsEnum(CourseStatus),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "status", void 0);
CreateCourseInput = __decorate([
    InputType('CreateCourseInput')
], CreateCourseInput);
export { CreateCourseInput };
//# sourceMappingURL=create-course.input.js.map