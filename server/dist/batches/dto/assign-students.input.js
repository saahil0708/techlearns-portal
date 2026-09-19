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
import { IsArray, IsOptional, IsString } from 'class-validator';
let BatchStudentAssignmentItem = class BatchStudentAssignmentItem {
    userId;
    rollNo;
};
__decorate([
    Field(() => String),
    IsString(),
    __metadata("design:type", String)
], BatchStudentAssignmentItem.prototype, "userId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], BatchStudentAssignmentItem.prototype, "rollNo", void 0);
BatchStudentAssignmentItem = __decorate([
    InputType('BatchStudentAssignmentItem')
], BatchStudentAssignmentItem);
export { BatchStudentAssignmentItem };
let AssignStudentsInput = class AssignStudentsInput {
    batchId;
    userIds;
    students;
};
__decorate([
    Field(() => String),
    IsString(),
    __metadata("design:type", String)
], AssignStudentsInput.prototype, "batchId", void 0);
__decorate([
    Field(() => [String], { nullable: true }),
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], AssignStudentsInput.prototype, "userIds", void 0);
__decorate([
    Field(() => [BatchStudentAssignmentItem], { nullable: true }),
    IsOptional(),
    IsArray(),
    __metadata("design:type", Array)
], AssignStudentsInput.prototype, "students", void 0);
AssignStudentsInput = __decorate([
    InputType('AssignStudentsInput')
], AssignStudentsInput);
export { AssignStudentsInput };
//# sourceMappingURL=assign-students.input.js.map