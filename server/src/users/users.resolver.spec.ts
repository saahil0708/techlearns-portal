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

  describe('Hierarchical RBAC for createUser', () => {
    it('allows Super Admin to create any role (SUPER_ADMIN, PLATFORM_ADMIN, etc.)', async () => {
      const usersService = {
        createWithInput: vi.fn().mockResolvedValue({ id: 'new-super', globalRole: Role.SUPER_ADMIN }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const superAdmin = {
        id: 'super-1',
        globalRole: Role.SUPER_ADMIN,
        memberships: [],
      } as any;

      const res = await resolver.createUser(
        {
          name: 'New Super Admin',
          email: 'newsuper@platform.org',
          password: 'Password123!',
          globalRole: Role.SUPER_ADMIN,
        },
        superAdmin,
      );

      expect(usersService.createWithInput).toHaveBeenCalled();
      expect(res.globalRole).toBe(Role.SUPER_ADMIN);
    });

    it('allows Platform Admin to create Institution Admin, Faculty, and Students', async () => {
      const usersService = {
        createWithInput: vi.fn().mockResolvedValue({ id: 'new-inst-admin', globalRole: Role.INSTITUTION_ADMIN }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const platformAdmin = {
        id: 'plat-1',
        globalRole: Role.PLATFORM_ADMIN,
        memberships: [],
      } as any;

      const res = await resolver.createUser(
        {
          name: 'Inst Admin',
          email: 'instadmin@univ.edu',
          password: 'Password123!',
          globalRole: Role.INSTITUTION_ADMIN,
          institutionId: 'inst-1',
        },
        platformAdmin,
      );

      expect(usersService.createWithInput).toHaveBeenCalled();
      expect(res.globalRole).toBe(Role.INSTITUTION_ADMIN);
    });

    it('prevents Platform Admin from creating Super Admin or Platform Admin accounts', async () => {
      const usersService = { createWithInput: vi.fn() } as any;
      const resolver = new UsersResolver(usersService);
      const platformAdmin = {
        id: 'plat-1',
        globalRole: Role.PLATFORM_ADMIN,
        memberships: [],
      } as any;

      await expect(
        resolver.createUser(
          {
            name: 'Attempted Super',
            email: 'super@univ.edu',
            password: 'Password123!',
            globalRole: Role.SUPER_ADMIN,
          },
          platformAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        resolver.createUser(
          {
            name: 'Attempted Plat',
            email: 'plat@univ.edu',
            password: 'Password123!',
            globalRole: Role.PLATFORM_ADMIN,
          },
          platformAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Institution Admin to create Faculty and Students in their institution', async () => {
      const usersService = {
        createWithInput: vi.fn().mockResolvedValue({ id: 'new-fac', globalRole: Role.FACULTY }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const instAdmin = {
        id: 'inst-admin-1',
        globalRole: Role.INSTITUTION_ADMIN,
        memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
      } as any;

      const res = await resolver.createUser(
        {
          name: 'Prof Alice',
          email: 'alice@inst1.edu',
          password: 'Password123!',
          globalRole: Role.FACULTY,
          institutionId: 'inst-1',
        },
        instAdmin,
      );

      expect(usersService.createWithInput).toHaveBeenCalled();
      expect(res.globalRole).toBe(Role.FACULTY);
    });

    it('prevents Institution Admin from creating Super Admin, Platform Admin, or other Institution Admins', async () => {
      const usersService = { createWithInput: vi.fn() } as any;
      const resolver = new UsersResolver(usersService);
      const instAdmin = {
        id: 'inst-admin-1',
        globalRole: Role.INSTITUTION_ADMIN,
        memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
      } as any;

      await expect(
        resolver.createUser(
          {
            name: 'Another Inst Admin',
            email: 'admin2@inst1.edu',
            password: 'Password123!',
            globalRole: Role.INSTITUTION_ADMIN,
            institutionId: 'inst-1',
          },
          instAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('prevents Institution Admin from creating users for another institution', async () => {
      const usersService = { createWithInput: vi.fn() } as any;
      const resolver = new UsersResolver(usersService);
      const instAdmin = {
        id: 'inst-admin-1',
        globalRole: Role.INSTITUTION_ADMIN,
        memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
      } as any;

      await expect(
        resolver.createUser(
          {
            name: 'Student Outside',
            email: 'stu@other.edu',
            password: 'Password123!',
            globalRole: Role.STUDENT,
            institutionId: 'inst-2',
          },
          instAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Faculty to create Students in their institution but rejects non-student roles', async () => {
      const usersService = {
        createWithInput: vi.fn().mockResolvedValue({ id: 'new-stu', globalRole: Role.STUDENT }),
      } as any;
      const resolver = new UsersResolver(usersService);
      const faculty = {
        id: 'faculty-1',
        globalRole: Role.FACULTY,
        memberships: [{ institutionId: 'inst-1', role: Role.FACULTY }],
      } as any;

      const res = await resolver.createUser(
        {
          name: 'Student Bob',
          email: 'bob@inst1.edu',
          password: 'Password123!',
          globalRole: Role.STUDENT,
          institutionId: 'inst-1',
        },
        faculty,
      );

      expect(res.globalRole).toBe(Role.STUDENT);

      await expect(
        resolver.createUser(
          {
            name: 'Faculty Peer',
            email: 'peer@inst1.edu',
            password: 'Password123!',
            globalRole: Role.FACULTY,
            institutionId: 'inst-1',
          },
          faculty,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
