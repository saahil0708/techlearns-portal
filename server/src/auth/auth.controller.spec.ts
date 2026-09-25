import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    user: {
      id: 'user-uuid-1',
      email: 'test@example.com',
      name: 'Test User',
      globalRole: Role.STUDENT,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: [],
    },
    tokens: {
      accessToken: 'mocked-jwt-token',
      refreshToken: 'mocked-refresh-token',
      expiresIn: 900,
    },
  };

  const mockReq = {
    headers: { 'user-agent': 'Mozilla/5.0' },
    ip: '127.0.0.1',
    cookies: {},
  } as any;

  const mockRes = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: vi.fn().mockResolvedValue(mockAuthResponse),
            login: vi.fn().mockResolvedValue(mockAuthResponse),
            oauthLogin: vi.fn().mockResolvedValue(mockAuthResponse),
            getProfile: vi.fn().mockResolvedValue(mockAuthResponse.user),
            refreshToken: vi.fn(),
            revokeToken: vi.fn(),
            revokeAllSessions: vi.fn(),
            verify2faLogin: vi.fn(),
            verifyPasskeyLogin: vi.fn(),
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
            listUserPasskeys: vi.fn(),
            deletePasskey: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user and set cookies', async () => {
    const dto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
    };

    const result = await controller.register(dto, mockReq, mockRes);
    expect(result).toEqual(mockAuthResponse);
    expect(authService.register).toHaveBeenCalledWith(dto, 'Mozilla/5.0', '127.0.0.1');
    expect(mockRes.cookie).toHaveBeenCalled();
  });

  it('should login an existing user and set cookies', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const result = await controller.login(dto, mockReq, mockRes);
    expect(result).toEqual(mockAuthResponse);
    expect(authService.login).toHaveBeenCalledWith(dto, 'Mozilla/5.0', '127.0.0.1');
    expect(mockRes.cookie).toHaveBeenCalled();
  });

  it('should authenticate via Firebase oauth and set cookies', async () => {
    const dto = {
      idToken: 'mock-firebase-id-token',
      provider: 'google',
    };

    const result = await controller.oauthLogin(dto, mockReq, mockRes);
    expect(result).toEqual(mockAuthResponse);
    expect(authService.oauthLogin).toHaveBeenCalledWith(
      'mock-firebase-id-token',
      'google',
      'Mozilla/5.0',
      '127.0.0.1',
    );
    expect(mockRes.cookie).toHaveBeenCalled();
  });

  it('should get current user profile', async () => {
    const userPayload = {
      id: 'user-uuid-1',
      email: 'test@example.com',
      name: 'Test User',
      globalRole: Role.STUDENT,
      memberships: [],
    };

    const result = await controller.getProfile(userPayload);
    expect(result).toEqual(mockAuthResponse.user);
    expect(authService.getProfile).toHaveBeenCalledWith('user-uuid-1');
  });
});


