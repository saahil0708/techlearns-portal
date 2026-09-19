import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
export interface TotpSetupResponse {
    secret: string;
    qrCodeDataUrl: string;
    otpauthUrl: string;
    recoveryCodes: string[];
}
export declare class TotpService {
    private prisma;
    private readonly appName;
    private readonly encryptionKeys;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateSecret(userId: string, email: string): Promise<TotpSetupResponse>;
    enable2FA(userId: string, secret: string, token: string, recoveryCodes: string[]): Promise<boolean>;
    verify2FA(userId: string, code: string): Promise<boolean>;
    disable2FA(userId: string, token: string): Promise<boolean>;
    private encrypt;
    private decrypt;
    private hashRecoveryCode;
    private matchesRecoveryCode;
}
