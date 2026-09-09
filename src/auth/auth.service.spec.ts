import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { TokenService } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let tokenService: TokenService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashed',
    globalRole: Role.STUDENT,
    status: UserStatus.ACTIVE,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [],
  };

  const mockSanitizedUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    globalRole: Role.STUDENT,
    status: UserStatus.ACTIVE,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [],
  };

  const mockTokens = {
    accessToken: 'mocked-access-token',
    refreshToken: 'mocked-refresh-token',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: vi.fn(),
            findById: vi.fn(),
            getProfile: vi.fn(),
            createUser: vi.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: vi.fn().mockResolvedValue(mockTokens),
            rotateRefreshToken: vi.fn().mockResolvedValue(mockTokens),
            revokeRefreshToken: vi.fn().mockResolvedValue({ message: 'Logged out' }),
            revokeAllUserSessions: vi.fn().mockResolvedValue({ message: 'All sessions revoked' }),
          },
        },
        {
          provide: TotpService,
          useValue: {
            generateTotpSecret: vi.fn(),
            enableTotp: vi.fn(),
            disableTotp: vi.fn(),
            verifyTotpToken: vi.fn(),
            generateLogin2faChallengeToken: vi.fn(),
            verifyLogin2faChallengeToken: vi.fn(),
          },
        },
        {
          provide: WebAuthnService,
          useValue: {
            generateRegistrationOptions: vi.fn(),
            verifyRegistrationResponse: vi.fn(),
            generateAuthenticationOptions: vi.fn(),
            verifyAuthenticationResponse: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user info with token pair', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      vi.spyOn(usersService, 'createUser').mockResolvedValue(mockSanitizedUser as any);
      vi.spyOn(usersService, 'findById').mockResolvedValue(mockSanitizedUser as any);
      vi.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed_pw');

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      });

      expect(result.user).toEqual(mockSanitizedUser);
      expect(result.tokens).toEqual(mockTokens);
      expect(tokenService.generateTokenPair).toHaveBeenCalled();
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('should throw ConflictException if email already in use', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return token pair and sanitized profile', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      vi.spyOn(usersService, 'findById').mockResolvedValue(mockSanitizedUser as any);

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.tokens).toEqual(mockTokens);
      expect(result.user).toEqual(mockSanitizedUser);
      expect(tokenService.generateTokenPair).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

