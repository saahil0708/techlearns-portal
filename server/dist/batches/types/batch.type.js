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
import { InstitutionType } from '../../institutions/types/institution.type.js';
import { BatchCountsType } from './batch-counts.type.js';
import { BatchStudentType } from './batch-student.type.js';
let BatchType = class BatchType {
    id;
    name;
    institutionId;
    collegeId;
    maxCapacity;
    status;
    startDate;
    endDate;
    createdAt;
    updatedAt;
    institution;
    students;
    _count;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], BatchType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], BatchType.prototype, "name", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], BatchType.prototype, "institutionId", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], BatchType.prototype, "collegeId", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], BatchType.prototype, "maxCapacity", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], BatchType.prototype, "status", void 0);
__decorate([
    Field(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], BatchType.prototype, "startDate", void 0);
__decorate([
    Field(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], BatchType.prototype, "endDate", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], BatchType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], BatchType.prototype, "updatedAt", void 0);
__decorate([
    Field(() => InstitutionType, { nullable: true }),
    __metadata("design:type", InstitutionType)
], BatchType.prototype, "institution", void 0);
__decorate([
    Field(() => [BatchStudentType], { nullable: true }),
    __metadata("design:type", Array)
], BatchType.prototype, "students", void 0);
__decorate([
    Field(() => BatchCountsType, { nullable: true }),
    __metadata("design:type", BatchCountsType)
], BatchType.prototype, "_count", void 0);
BatchType = __decorate([
    ObjectType('Batch')
], BatchType);
export { BatchType };
//# sourceMappingURL=batch.type.js.map