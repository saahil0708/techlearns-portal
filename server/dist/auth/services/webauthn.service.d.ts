import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
export declare class WebAuthnService {
    private prisma;
    private configService;
    private readonly rpName;
    private readonly rpId;
    private readonly expectedOrigin;
    constructor(prisma: PrismaService, configService: ConfigService);
    private saveChallenge;
    private consumeChallenge;
    generatePasskeyRegistrationOptions(userId: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyPasskeyRegistration(userId: string, response: any, deviceName?: string): Promise<{
        verified: boolean;
        passkeyId: string;
    }>;
    generatePasskeyLoginOptions(email?: string): Promise<{
        challengeKey: string;
        challenge: import("@simplewebauthn/server").Base64URLString;
        timeout?: number;
        rpId?: string;
        allowCredentials?: import("@simplewebauthn/server").PublicKeyCredentialDescriptorJSON[];
        userVerification?: import("@simplewebauthn/server").UserVerificationRequirement;
        hints?: import("@simplewebauthn/server").PublicKeyCredentialHint[];
        extensions?: import("@simplewebauthn/server").AuthenticationExtensionsClientInputs;
    }>;
    verifyPasskeyLogin(response: any, challengeKey: string): Promise<{
        verified: boolean;
        userId: string;
        email: string;
        globalRole: string;
    }>;
    listUserPasskeys(userId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        credentialId: string;
        deviceType: string | null;
        backedUp: boolean;
        lastUsedAt: Date | null;
    }[]>;
    deletePasskey(userId: string, passkeyId: string): Promise<{
        success: boolean;
    }>;
}
