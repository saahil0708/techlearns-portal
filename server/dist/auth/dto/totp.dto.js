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
import { IsArray, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
export class Enable2faDto {
    secret;
    token;
    recoveryCodes;
}
__decorate([
    ApiProperty({ description: 'The generated base32 TOTP secret' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Enable2faDto.prototype, "secret", void 0);
__decorate([
    ApiProperty({ description: 'The 6-digit TOTP verification code from Authenticator app' }),
    IsString(),
    Length(6, 6),
    __metadata("design:type", String)
], Enable2faDto.prototype, "token", void 0);
__decorate([
    ApiProperty({ description: 'One-time backup recovery codes' }),
    IsArray(),
    __metadata("design:type", Array)
], Enable2faDto.prototype, "recoveryCodes", void 0);
export class Verify2faDto {
    challengeToken;
    code;
}
__decorate([
    ApiPropertyOptional({ description: 'Signed temporary 2FA challenge token received during login' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], Verify2faDto.prototype, "challengeToken", void 0);
__decorate([
    ApiProperty({ description: '6-digit TOTP code or 8-character backup recovery code' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Verify2faDto.prototype, "code", void 0);
export class Disable2faDto {
    token;
}
__decorate([
    ApiProperty({ description: '6-digit TOTP code to confirm disabling 2FA' }),
    IsString(),
    Length(6, 6),
    __metadata("design:type", String)
], Disable2faDto.prototype, "token", void 0);
//# sourceMappingURL=totp.dto.js.map