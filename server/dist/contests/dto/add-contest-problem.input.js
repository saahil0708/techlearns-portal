var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
let AddContestProblemInput = class AddContestProblemInput {
    problemId;
    points = 100;
    order = 0;
};
__decorate([
    Field(() => ID),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], AddContestProblemInput.prototype, "problemId", void 0);
__decorate([
    Field(() => Int, { defaultValue: 100, nullable: true }),
    IsOptional(),
    Min(1),
    __metadata("design:type", Number)
], AddContestProblemInput.prototype, "points", void 0);
__decorate([
    Field(() => Int, { defaultValue: 0, nullable: true }),
    IsOptional(),
    __metadata("design:type", Number)
], AddContestProblemInput.prototype, "order", void 0);
AddContestProblemInput = __decorate([
    InputType('AddContestProblemInput')
], AddContestProblemInput);
export { AddContestProblemInput };
//# sourceMappingURL=add-contest-problem.input.js.map