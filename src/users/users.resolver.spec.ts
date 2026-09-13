import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { UsersResolver } from './users.resolver.js';

describe('UsersResolver tenant access', () => {
  it('does not let a college admin use a non-admin membership to view another college tenant', async () => {
    const usersService = {
      findById: vi.fn().mockResolvedValue({
        id: 'student-b',
        memberships: [{ collegeId: 'college-b', role: Role.STUDENT }],
      }),
    } as any;
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

  describe('Faculty student invitation permissions', () => {
    it('allows faculty to invite students to their assigned college', async () => {
      const usersService = {
        bulkInvite: vi.fn().mockResolvedValue({ invited: 1, expiresInHours: 72 }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const facultyUser = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ collegeId: 'college-a', role: Role.FACULTY }],
      } as any;

      const result = await resolver.bulkInviteUsers(
        {
          users: [
            { name: 'Student One', email: 'stu1@college.edu', role: Role.STUDENT, collegeId: 'college-a' },
          ],
        },
        facultyUser,
      );

      expect(usersService.bulkInvite).toHaveBeenCalled();
      expect(result.invited).toBe(1);
    });

    it('rejects faculty inviting students to an unassigned college', async () => {
      const usersService = {
        bulkInvite: vi.fn(),
      } as any;
      const resolver = new UsersResolver(usersService);
      const facultyUser = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ collegeId: 'college-a', role: Role.FACULTY }],
      } as any;

      await expect(
        resolver.bulkInviteUsers(
          {
            users: [
              { name: 'Student Two', email: 'stu2@college.edu', role: Role.STUDENT, collegeId: 'college-b' },
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
        memberships: [{ collegeId: 'college-a', role: Role.FACULTY }],
      } as any;

      await expect(
        resolver.bulkInviteUsers(
          {
            users: [
              { name: 'Prof Two', email: 'prof2@college.edu', role: Role.FACULTY, collegeId: 'college-a' },
            ],
          },
          facultyUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
