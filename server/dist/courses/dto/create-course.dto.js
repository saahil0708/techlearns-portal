var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateCourseDto {
    title;
    description;
    institutionId;
    collegeId;
    status;
}
__decorate([
    ApiProperty({
        example: 'Data Structures and Algorithms in C++',
        description: 'Title of the course',
    }),
    IsString(),
    IsNotEmpty({ message: 'Course title is required' }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Master core data structures and algorithm analysis techniques.',
        description: 'Course description and syllabus overview',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'institution-uuid-12345',
        description: 'ID of the institution (leave empty for platform-wide course)',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "institutionId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'college-uuid-12345',
        description: 'ID of the college (legacy alias)',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "collegeId", void 0);
__decorate([
    ApiPropertyOptional({
        enum: CourseStatus,
        default: CourseStatus.DRAFT,
    }),
    IsOptional(),
    IsEnum(CourseStatus),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "status", void 0);
//# sourceMappingURL=create-course.dto.js.map