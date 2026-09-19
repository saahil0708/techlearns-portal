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
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
export class CreateLessonDto {
    title;
    content;
    order;
}
__decorate([
    ApiProperty({
        example: 'Introduction to Two-Pointer Techniques',
        description: 'Title of the lesson',
    }),
    IsString(),
    IsNotEmpty({ message: 'Lesson title is required' }),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    ApiProperty({
        example: '# Two-Pointer Approach\n\nWhen working with sorted arrays...',
        description: 'Markdown content of the lesson',
    }),
    IsString(),
    IsNotEmpty({ message: 'Lesson content is required' }),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "content", void 0);
__decorate([
    ApiPropertyOptional({
        example: 1,
        description: 'Display order index of this lesson inside the module',
        default: 0,
    }),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "order", void 0);
//# sourceMappingURL=create-lesson.dto.js.map