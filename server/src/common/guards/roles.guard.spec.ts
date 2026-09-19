import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access if no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user is missing', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.FACULTY]);
    const context = createMockContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow SUPER_ADMIN to access any role-protected endpoint', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.FACULTY]);
    const context = createMockContext({
      id: '1',
      globalRole: Role.SUPER_ADMIN,
      memberships: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user if globalRole matches required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.FACULTY]);
    const context = createMockContext({
      id: '2',
      globalRole: Role.FACULTY,
      memberships: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user if institution membership role matches required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.INSTITUTION_ADMIN]);
    const context = createMockContext({
      id: '3',
      globalRole: Role.STUDENT,
      memberships: [{ institutionId: 'institution-1', role: Role.INSTITUTION_ADMIN }],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if neither globalRole nor memberships match required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.PLATFORM_ADMIN]);
    const context = createMockContext({
      id: '4',
      globalRole: Role.STUDENT,
      memberships: [{ institutionId: 'institution-1', role: Role.STUDENT }],
    });
    expect(guard.canActivate(context)).toBe(false);
  });
});
