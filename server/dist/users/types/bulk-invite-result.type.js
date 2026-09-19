var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, Int, ObjectType } from '@nestjs/graphql';
let InvitationLinkItemType = class InvitationLinkItemType {
    email;
    activationUrl;
};
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InvitationLinkItemType.prototype, "email", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], InvitationLinkItemType.prototype, "activationUrl", void 0);
InvitationLinkItemType = __decorate([
    ObjectType('InvitationLinkItem')
], InvitationLinkItemType);
export { InvitationLinkItemType };
let BulkInviteResultType = class BulkInviteResultType {
    invited;
    expiresInHours;
    invitationLinks;
};
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], BulkInviteResultType.prototype, "invited", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], BulkInviteResultType.prototype, "expiresInHours", void 0);
__decorate([
    Field(() => [InvitationLinkItemType], { nullable: true }),
    __metadata("design:type", Array)
], BulkInviteResultType.prototype, "invitationLinks", void 0);
BulkInviteResultType = __decorate([
    ObjectType('BulkInviteResult')
], BulkInviteResultType);
export { BulkInviteResultType };
//# sourceMappingURL=bulk-invite-result.type.js.map