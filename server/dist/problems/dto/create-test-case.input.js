var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
let CreateTestCaseInput = class CreateTestCaseInput {
    input;
    expectedOutput;
    isHidden = true;
    explanation;
    order = 0;
};
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateTestCaseInput.prototype, "input", void 0);
__decorate([
    Field(() => String),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateTestCaseInput.prototype, "expectedOutput", void 0);
__decorate([
    Field(() => Boolean, { defaultValue: true, nullable: true }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateTestCaseInput.prototype, "isHidden", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateTestCaseInput.prototype, "explanation", void 0);
__decorate([
    Field(() => Int, { defaultValue: 0, nullable: true }),
    IsOptional(),
    __metadata("design:type", Number)
], CreateTestCaseInput.prototype, "order", void 0);
CreateTestCaseInput = __decorate([
    InputType('CreateTestCaseInput')
], CreateTestCaseInput);
export { CreateTestCaseInput };
//# sourceMappingURL=create-test-case.input.js.map