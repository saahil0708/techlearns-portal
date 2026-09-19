import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
export function validateUserCreationRBAC(currentUser, targetRole, targetInstitutionId) {
    const callerGlobalRole = currentUser.globalRole;
    if (callerGlobalRole === Role.SUPER_ADMIN) {
        return;
    }
    if (callerGlobalRole === Role.PLATFORM_ADMIN) {
        if (targetRole === Role.SUPER_ADMIN || targetRole === Role.PLATFORM_ADMIN) {
            throw new ForbiddenException('Platform administrators cannot create or invite Super Admin or Platform Admin accounts.');
        }
        return;
    }
    const adminInstitutionIds = currentUser.memberships
        ?.filter((m) => m.role === Role.INSTITUTION_ADMIN)
        .map((m) => m.institutionId) || [];
    const facultyInstitutionIds = currentUser.memberships
        ?.filter((m) => m.role === Role.FACULTY)
        .map((m) => m.institutionId) || [];
    const isInstitutionAdmin = callerGlobalRole === Role.INSTITUTION_ADMIN || adminInstitutionIds.length > 0;
    const isFaculty = callerGlobalRole === Role.FACULTY || facultyInstitutionIds.length > 0;
    if (isInstitutionAdmin) {
        if (!targetInstitutionId) {
            throw new ForbiddenException('Institution admin must specify an institutionId for user creation.');
        }
        if (adminInstitutionIds.length === 0 || !adminInstitutionIds.includes(targetInstitutionId)) {
            throw new ForbiddenException('You can only create or invite users within your assigned institution(s).');
        }
        if (targetRole !== Role.FACULTY && targetRole !== Role.STUDENT) {
            throw new ForbiddenException('Institution administrators can only create or invite Faculty and Student accounts.');
        }
        return;
    }
    if (isFaculty) {
        if (!targetInstitutionId) {
            throw new ForbiddenException('Faculty must specify an institutionId for user creation.');
        }
        if (facultyInstitutionIds.length === 0 || !facultyInstitutionIds.includes(targetInstitutionId)) {
            throw new ForbiddenException('You can only create or invite users within your assigned institution(s).');
        }
        if (targetRole !== Role.STUDENT) {
            throw new ForbiddenException('Faculty members can only create or invite Student accounts.');
        }
        return;
    }
    throw new ForbiddenException('You do not have permission to create or invite users.');
}
//# sourceMappingURL=user-rbac.util.js.map