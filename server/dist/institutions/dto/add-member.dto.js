var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
const INSTITUTION_ROLES = [Role.INSTITUTION_ADMIN, Role.FACULTY, Role.STUDENT];
export class AddMemberDto {
    userId;
    role;
}
__decorate([
    ApiProperty({
        example: 'user-uuid-12345',
        description: 'Unique ID of the user to add to the institution',
    }),
    IsString(),
    IsNotEmpty({ message: 'User ID is required' }),
    __metadata("design:type", String)
], AddMemberDto.prototype, "userId", void 0);
__decorate([
    ApiProperty({
        enum: INSTITUTION_ROLES,
        example: Role.STUDENT,
        description: 'Role of the member in this institution',
    }),
    IsEnum(INSTITUTION_ROLES, { message: 'Valid institution role is required' }),
    __metadata("design:type", Object)
], AddMemberDto.prototype, "role", void 0);
//# sourceMappingURL=add-member.dto.js.map