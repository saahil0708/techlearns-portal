import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface TotpSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

@Injectable()
export class TotpService {
  private readonly appName = 'CodePlatform';

  constructor(private prisma: PrismaService) {}

  /**
   * Generates a new TOTP secret, QR code data URL, and 8 one-time recovery backup codes
   */
  async generateSecret(userId: string, email: string): Promise<TotpSetupResponse> {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: this.appName,
      label: email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate 8 cryptographically secure 8-character backup codes
    const recoveryCodes: string[] = [];
    for (let i = 0; i < 8; i++) {
      recoveryCodes.push(randomBytes(4).toString('hex').toUpperCase());
    }

    return {
      secret,
      qrCodeDataUrl,
      otpauthUrl,
      recoveryCodes,
    };
  }

  /**
   * Enables TOTP 2FA on the user's account after verifying the first valid token
   */
  async enable2FA(
    userId: string,
    secret: string,
    token: string,
    recoveryCodes: string[],
  ): Promise<boolean> {
    const result = verifySync({ token, secret, epochTolerance: 30 });
    if (!result.valid) {
      throw new BadRequestException('Invalid 6-digit verification code. Please try again.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorRecoveryCodes: recoveryCodes,
      },
    });

    return true;
  }

  /**
   * Verifies a 6-digit TOTP token or 8-character backup recovery code for authentication
   */
  async verify2FA(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorRecoveryCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor authentication is not enabled for this user.');
    }

    // Check if token matches standard 6-digit TOTP
    const result = verifySync({
      token: code,
      secret: user.twoFactorSecret,
      epochTolerance: 30,
    });

    if (result.valid) {
      return true;
    }

    // Check if code matches an unused backup recovery code atomically inside a transaction
    const normalizedCode = code.trim().toUpperCase();
    const consumed = await this.prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: userId },
        select: { twoFactorRecoveryCodes: true },
      });

      if (!freshUser) {
        return false;
      }

      const codeIndex = freshUser.twoFactorRecoveryCodes.indexOf(normalizedCode);
      if (codeIndex === -1) {
        return false;
      }

      const updatedCodes = [...freshUser.twoFactorRecoveryCodes];
      updatedCodes.splice(codeIndex, 1);

      await tx.user.update({
        where: { id: userId },
        data: { twoFactorRecoveryCodes: updatedCodes },
      });

      return true;
    });

    if (consumed) {
      return true;
    }

    throw new UnauthorizedException('Invalid 2FA code or backup recovery code.');
  }

  /**
   * Disables TOTP 2FA for a user
   */
  async disable2FA(userId: string, token: string): Promise<boolean> {
    await this.verify2FA(userId, token);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
      },
    });

    return true;
  }
}

