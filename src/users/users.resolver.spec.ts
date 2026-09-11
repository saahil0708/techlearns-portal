import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { UsersResolver } from './users.resolver.js';

describe('UsersResolver tenant access', () => {
  it('does not let a college admin use a non-admin membership to view another college tenant', async () => {
    const usersService = { findById: vi.fn().mockResolvedValue({
      id: 'student-b',
      memberships: [{ collegeId: 'college-b', role: Role.STUDENT }],
    }) } as any;
    const resolver = new UsersResolver(usersService);
    const currentUser = {
      id: 'admin-a',
      globalRole: Role.COLLEGE_ADMIN,
      memberships: [
        { collegeId: 'college-a', role: Role.COLLEGE_ADMIN },
        { collegeId: 'college-b', role: Role.FACULTY },
      ],
    } as any;

    await expect(resolver.getUser('student-b', currentUser)).rejects.toThrow(ForbiddenException);
  });
});
