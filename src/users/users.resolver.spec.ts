import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { UsersResolver } from './users.resolver.js';

describe('UsersResolver tenant access', () => {
  it('does not let an institution admin use a non-admin membership to view another institution tenant', async () => {
    const usersService = {
      findById: vi.fn().mockResolvedValue({
        id: 'student-b',
        memberships: [{ institutionId: 'institution-b', role: Role.STUDENT }],
      }),
    } as any;
    const resolver = new UsersResolver(usersService);
    const currentUser = {
      id: 'admin-a',
      globalRole: Role.INSTITUTION_ADMIN,
      memberships: [
        { institutionId: 'institution-a', role: Role.INSTITUTION_ADMIN },
        { institutionId: 'institution-b', role: Role.FACULTY },
      ],
    } as any;

    await expect(resolver.getUser('student-b', currentUser)).rejects.toThrow(ForbiddenException);
  });

  describe('Faculty student invitation permissions', () => {
    it('allows faculty to invite students to their assigned institution', async () => {
      const usersService = {
        bulkInvite: vi.fn().mockResolvedValue({ invited: 1, expiresInHours: 72 }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const facultyUser = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ institutionId: 'institution-a', role: Role.FACULTY }],
      } as any;

      const result = await resolver.bulkInviteUsers(
        {
          users: [
            { name: 'Student One', email: 'stu1@institution.edu', role: Role.STUDENT, institutionId: 'institution-a' },
          ],
        },
        facultyUser,
      );

      expect(usersService.bulkInvite).toHaveBeenCalled();
      expect(result.invited).toBe(1);
    });

    it('rejects faculty inviting students to an unassigned institution', async () => {
      const usersService = {
        bulkInvite: vi.fn(),
      } as any;
      const resolver = new UsersResolver(usersService);
      const facultyUser = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ institutionId: 'institution-a', role: Role.FACULTY }],
      } as any;

      await expect(
        resolver.bulkInviteUsers(
          {
            users: [
              { name: 'Student Two', email: 'stu2@institution.edu', role: Role.STUDENT, institutionId: 'institution-b' },
            ],
          },
          facultyUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects faculty trying to invite non-student roles', async () => {
      const usersService = {
        bulkInvite: vi.fn(),
      } as any;
      const resolver = new UsersResolver(usersService);
      const facultyUser = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ institutionId: 'institution-a', role: Role.FACULTY }],
      } as any;

      await expect(
        resolver.bulkInviteUsers(
          {
            users: [
              { name: 'Prof Two', email: 'prof2@institution.edu', role: Role.FACULTY, institutionId: 'institution-a' },
            ],
          },
          facultyUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
