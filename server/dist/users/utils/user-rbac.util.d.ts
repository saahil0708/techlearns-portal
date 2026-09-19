import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../../common/types/current-user.interface.js';
export declare function validateUserCreationRBAC(currentUser: CurrentUserPayload, targetRole: Role, targetInstitutionId?: string): void;
