import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../../common/types/current-user.interface.js';

/**
 * Validates that `currentUser` is allowed to create or invite a user with `targetRole`
 * into `targetInstitutionId`.
 *
 * RBAC Hierarchy Matrix:
 * - SUPER_ADMIN: Can create/invite any role (SUPER_ADMIN, PLATFORM_ADMIN, INSTITUTION_ADMIN, FACULTY, STUDENT) globally or in any institution.
 * - PLATFORM_ADMIN: Can create/invite INSTITUTION_ADMIN, FACULTY, STUDENT (forbidden: SUPER_ADMIN, PLATFORM_ADMIN).
 * - INSTITUTION_ADMIN: Can create/invite FACULTY and STUDENT strictly within their assigned institutionId. (forbidden: SUPER_ADMIN, PLATFORM_ADMIN, INSTITUTION_ADMIN, or outside assigned institution).
 * - FACULTY: Can create/invite STUDENT strictly within their assigned institutionId. (forbidden: creating any other role, or outside assigned institution).
 * - STUDENT: Forbidden from creating or inviting users.
 */
export function validateUserCreationRBAC(
  currentUser: CurrentUserPayload,
  targetRole: Role,
  targetInstitutionId?: string,
): void {
  const callerGlobalRole = currentUser.globalRole;

  if (callerGlobalRole === Role.SUPER_ADMIN) {
    return;
  }

  if (callerGlobalRole === Role.PLATFORM_ADMIN) {
    if (targetRole === Role.SUPER_ADMIN || targetRole === Role.PLATFORM_ADMIN) {
      throw new ForbiddenException(
        'Platform administrators cannot create or invite Super Admin or Platform Admin accounts.',
      );
    }
    return;
  }

  const adminInstitutionIds =
    currentUser.memberships
      ?.filter((m) => m.role === Role.INSTITUTION_ADMIN)
      .map((m) => m.institutionId) || [];

  const facultyInstitutionIds =
    currentUser.memberships
      ?.filter((m) => m.role === Role.FACULTY)
      .map((m) => m.institutionId) || [];

  const isInstitutionAdmin =
    callerGlobalRole === Role.INSTITUTION_ADMIN || adminInstitutionIds.length > 0;
  const isFaculty = callerGlobalRole === Role.FACULTY || facultyInstitutionIds.length > 0;

  if (isInstitutionAdmin) {
    if (!targetInstitutionId) {
      throw new ForbiddenException('Institution admin must specify an institutionId for user creation.');
    }
    if (adminInstitutionIds.length === 0 || !adminInstitutionIds.includes(targetInstitutionId)) {
      throw new ForbiddenException(
        'You can only create or invite users within your assigned institution(s).',
      );
    }
    if (targetRole !== Role.FACULTY && targetRole !== Role.STUDENT) {
      throw new ForbiddenException(
        'Institution administrators can only create or invite Faculty and Student accounts.',
      );
    }
    return;
  }

  if (isFaculty) {
    if (!targetInstitutionId) {
      throw new ForbiddenException('Faculty must specify an institutionId for user creation.');
    }
    if (facultyInstitutionIds.length === 0 || !facultyInstitutionIds.includes(targetInstitutionId)) {
      throw new ForbiddenException(
        'You can only create or invite users within your assigned institution(s).',
      );
    }
    if (targetRole !== Role.STUDENT) {
      throw new ForbiddenException('Faculty members can only create or invite Student accounts.');
    }
    return;
  }

  throw new ForbiddenException('You do not have permission to create or invite users.');
}
