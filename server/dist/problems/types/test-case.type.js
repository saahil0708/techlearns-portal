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
let TestCaseType = class TestCaseType {
    id;
    problemId;
    input;
    expectedOutput;
    isHidden;
    explanation;
    order;
    createdAt;
    updatedAt;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], TestCaseType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], TestCaseType.prototype, "problemId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], TestCaseType.prototype, "input", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], TestCaseType.prototype, "expectedOutput", void 0);
__decorate([
    Field(() => Boolean),
    __metadata("design:type", Boolean)
], TestCaseType.prototype, "isHidden", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], TestCaseType.prototype, "explanation", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], TestCaseType.prototype, "order", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], TestCaseType.prototype, "createdAt", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], TestCaseType.prototype, "updatedAt", void 0);
TestCaseType = __decorate([
    ObjectType('TestCase')
], TestCaseType);
export { TestCaseType };
//# sourceMappingURL=test-case.type.js.map