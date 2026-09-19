var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/types/user.type.js';
let ContestRegistrationType = class ContestRegistrationType {
    id;
    contestId;
    userId;
    registeredAt;
    user;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], ContestRegistrationType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestRegistrationType.prototype, "contestId", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], ContestRegistrationType.prototype, "userId", void 0);
__decorate([
    Field(() => Date),
    __metadata("design:type", Date)
], ContestRegistrationType.prototype, "registeredAt", void 0);
__decorate([
    Field(() => UserType, { nullable: true }),
    __metadata("design:type", UserType)
], ContestRegistrationType.prototype, "user", void 0);
ContestRegistrationType = __decorate([
    ObjectType('ContestRegistration')
], ContestRegistrationType);
export { ContestRegistrationType };
//# sourceMappingURL=contest-registration.type.js.map