import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { UsersController } from './users.controller.js';

describe('UsersController', () => {
  it('allows Super Admin to create any role', async () => {
    const usersService = {
      createWithInput: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Super Created' }),
    } as any;
    const controller = new UsersController(usersService);
    const superAdmin = {
      id: 'super-1',
      globalRole: Role.SUPER_ADMIN,
      memberships: [],
    } as any;

    const res = await controller.createUser(
      {
        name: 'New Platform Admin',
        email: 'plat@org.com',
        password: 'Password123!',
        globalRole: Role.PLATFORM_ADMIN,
      },
      superAdmin,
    );

    expect(usersService.createWithInput).toHaveBeenCalled();
    expect(res).toEqual({ id: 'user-1', name: 'Super Created' });
  });

  it('rejects Platform Admin from creating Super Admin', async () => {
    const usersService = { createWithInput: vi.fn() } as any;
    const controller = new UsersController(usersService);
    const platformAdmin = {
      id: 'plat-1',
      globalRole: Role.PLATFORM_ADMIN,
      memberships: [],
    } as any;

    await expect(
      controller.createUser(
        {
          name: 'Super Admin Attempt',
          email: 'super@org.com',
          password: 'Password123!',
          globalRole: Role.SUPER_ADMIN,
        },
        platformAdmin,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows Institution Admin to create Faculty and Students in their institution', async () => {
    const usersService = {
      createWithInput: vi.fn().mockResolvedValue({ id: 'fac-1', name: 'Faculty Bob' }),
    } as any;
    const controller = new UsersController(usersService);
    const instAdmin = {
      id: 'inst-admin-1',
      globalRole: Role.INSTITUTION_ADMIN,
      memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
    } as any;

    const res = await controller.createUser(
      {
        name: 'Faculty Bob',
        email: 'bob@inst1.edu',
        password: 'Password123!',
        globalRole: Role.FACULTY,
        institutionId: 'inst-1',
      },
      instAdmin,
    );

    expect(usersService.createWithInput).toHaveBeenCalled();
    expect(res.name).toBe('Faculty Bob');
  });

  it('rejects Institution Admin creating a Super Admin or creating in another institution', async () => {
    const usersService = { createWithInput: vi.fn() } as any;
    const controller = new UsersController(usersService);
    const instAdmin = {
      id: 'inst-admin-1',
      globalRole: Role.INSTITUTION_ADMIN,
      memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
    } as any;

    await expect(
      controller.createUser(
        {
          name: 'Super Admin',
          email: 'super@inst1.edu',
          password: 'Password123!',
          globalRole: Role.SUPER_ADMIN,
          institutionId: 'inst-1',
        },
        instAdmin,
      ),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      controller.createUser(
        {
          name: 'Student Outside',
          email: 'student@other.edu',
          password: 'Password123!',
          globalRole: Role.STUDENT,
          institutionId: 'inst-2',
        },
        instAdmin,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows Faculty to create Student in assigned institution, but rejects non-student', async () => {
    const usersService = {
      createWithInput: vi.fn().mockResolvedValue({ id: 'stu-1', name: 'Student Dan' }),
    } as any;
    const controller = new UsersController(usersService);
    const faculty = {
      id: 'faculty-1',
      globalRole: Role.FACULTY,
      memberships: [{ institutionId: 'inst-1', role: Role.FACULTY }],
    } as any;

    const res = await controller.createUser(
      {
        name: 'Student Dan',
        email: 'dan@inst1.edu',
        password: 'Password123!',
        globalRole: Role.STUDENT,
        institutionId: 'inst-1',
      },
      faculty,
    );

    expect(res.name).toBe('Student Dan');

    await expect(
      controller.createUser(
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

  it('executes bulk invite with RBAC check per item', async () => {
    const usersService = {
      bulkInvite: vi.fn().mockResolvedValue({ invited: 2, expiresInHours: 72 }),
    } as any;
    const controller = new UsersController(usersService);
    const instAdmin = {
      id: 'inst-admin-1',
      globalRole: Role.INSTITUTION_ADMIN,
      memberships: [{ institutionId: 'inst-1', role: Role.INSTITUTION_ADMIN }],
    } as any;

    const result = await controller.bulkInvite(
      {
        users: [
          { name: 'Faculty 1', email: 'f1@inst1.edu', role: Role.FACULTY, institutionId: 'inst-1' },
          { name: 'Student 1', email: 's1@inst1.edu', role: Role.STUDENT, institutionId: 'inst-1' },
        ],
      },
      instAdmin,
    );

    expect(usersService.bulkInvite).toHaveBeenCalled();
    expect(result.invited).toBe(2);
  });

  it('rejects bulk invite if any item violates RBAC', async () => {
    const usersService = { bulkInvite: vi.fn() } as any;
    const controller = new UsersController(usersService);
    const faculty = {
      id: 'faculty-1',
      globalRole: Role.FACULTY,
      memberships: [{ institutionId: 'inst-1', role: Role.FACULTY }],
    } as any;

    await expect(
      controller.bulkInvite(
        {
          users: [
            { name: 'Student 1', email: 's1@inst1.edu', role: Role.STUDENT, institutionId: 'inst-1' },
            { name: 'Admin 1', email: 'a1@inst1.edu', role: Role.INSTITUTION_ADMIN, institutionId: 'inst-1' },
          ],
        },
        faculty,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
