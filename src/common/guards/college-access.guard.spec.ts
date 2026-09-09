import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollegeAccessGuard } from './college-access.guard.js';

describe('CollegeAccessGuard', () => {
  let guard: CollegeAccessGuard;

  beforeEach(() => {
    guard = new CollegeAccessGuard();
  });

  const createMockContext = (user: any, params: any = {}, body: any = {}, query: any = {}): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user, params, body, query }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow SUPER_ADMIN access to any college', () => {
    const context = createMockContext(
      { id: '1', globalRole: Role.SUPER_ADMIN, memberships: [] },
      { collegeId: 'college-1' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow PLATFORM_ADMIN access to any college', () => {
    const context = createMockContext(
      { id: '2', globalRole: Role.PLATFORM_ADMIN, memberships: [] },
      { collegeId: 'college-1' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow student or faculty who is a member of the requested college', () => {
    const context = createMockContext(
      {
        id: '3',
        globalRole: Role.STUDENT,
        memberships: [{ collegeId: 'college-1', role: Role.STUDENT }],
      },
      { collegeId: 'college-1' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not a member of the requested college', () => {
    const context = createMockContext(
      {
        id: '4',
        globalRole: Role.STUDENT,
        memberships: [{ collegeId: 'college-2', role: Role.STUDENT }],
      },
      { collegeId: 'college-1' },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
