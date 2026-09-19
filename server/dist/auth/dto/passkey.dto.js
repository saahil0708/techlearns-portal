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
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
export class PasskeyRegistrationVerifyDto {
    response;
    deviceName;
}
__decorate([
    ApiProperty({ description: 'WebAuthn PublicKeyCredential registration response JSON object' }),
    IsObject(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], PasskeyRegistrationVerifyDto.prototype, "response", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Friendly device name (e.g. YubiKey 5C NFC, MacBook Touch ID)' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PasskeyRegistrationVerifyDto.prototype, "deviceName", void 0);
export class PasskeyLoginChallengeDto {
    email;
}
__decorate([
    ApiPropertyOptional({ description: 'Optional email for non-discoverable passkey credentials' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PasskeyLoginChallengeDto.prototype, "email", void 0);
export class PasskeyLoginVerifyDto {
    response;
    challengeKey;
}
__decorate([
    ApiProperty({ description: 'WebAuthn PublicKeyCredential authentication response JSON object' }),
    IsObject(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], PasskeyLoginVerifyDto.prototype, "response", void 0);
__decorate([
    ApiProperty({ description: 'The challenge session key received from login challenge generation' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], PasskeyLoginVerifyDto.prototype, "challengeKey", void 0);
//# sourceMappingURL=passkey.dto.js.map