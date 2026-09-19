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
let LessonType = class LessonType {
    id;
    moduleId;
    title;
    content;
    order;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], LessonType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], LessonType.prototype, "moduleId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], LessonType.prototype, "title", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], LessonType.prototype, "content", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], LessonType.prototype, "order", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], LessonType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], LessonType.prototype, "updatedAt", void 0);
LessonType = __decorate([
    ObjectType('Lesson')
], LessonType);
export { LessonType };
//# sourceMappingURL=lesson.type.js.map