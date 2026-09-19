var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MinLength, validateSync, } from 'class-validator';
export var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (Environment = {}));
export class EnvironmentVariables {
    NODE_ENV = Environment.Development;
    PORT = 8000;
    DATABASE_URL;
    JWT_SECRET;
    JWT_EXPIRES_IN = '1d';
    TOTP_ENCRYPTION_KEY;
    TOTP_PREVIOUS_ENCRYPTION_KEYS;
    REDIS_HOST = 'localhost';
    REDIS_PORT = 6379;
    REDIS_PASSWORD;
    JUDGE_QUEUE_NAME = 'submission-queue';
    JUDGE_IMAGE;
}
__decorate([
    IsEnum(Environment),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
__decorate([
    IsString(),
    MinLength(16, {
        message: 'JWT_SECRET must be at least 16 characters long for security',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_EXPIRES_IN", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "TOTP_ENCRYPTION_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "TOTP_PREVIOUS_ENCRYPTION_KEYS", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_HOST", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "REDIS_PORT", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_PASSWORD", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JUDGE_QUEUE_NAME", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JUDGE_IMAGE", void 0);
export function validateEnvironment(config) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        const errorMessages = errors
            .map((error) => Object.values(error.constraints || {}).join(', '))
            .join('; ');
        throw new Error(`Environment validation failed: ${errorMessages}`);
    }
    return validatedConfig;
}
//# sourceMappingURL=env.validation.js.map