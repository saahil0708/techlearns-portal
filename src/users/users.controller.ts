import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BulkInviteDto } from './dto/bulk-invite.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
import { validateUserCreationRBAC } from './utils/user-rbac.util.js';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({
    summary: 'Create a single user account with strict hierarchical RBAC enforcement',
    description:
      'SUPER_ADMIN can create any role. PLATFORM_ADMIN can create Institution Admin, Faculty, and Students. INSTITUTION_ADMIN can create Faculty and Students within their tenant. FACULTY can only create Students within their tenant.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient hierarchical role privilege' })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const targetInstitutionId = dto.institutionId || dto.collegeId;
    const targetRole = dto.globalRole || Role.STUDENT;

    validateUserCreationRBAC(currentUser, targetRole, targetInstitutionId);

    return this.usersService.createWithInput(dto);
  }

  @Post('bulk-invite')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk invite users with strict hierarchical RBAC validation per invitee',
  })
  @ApiResponse({ status: 200, description: 'Invitations processed and queued' })
  @ApiResponse({ status: 403, description: 'Forbidden: One or more target roles exceed privilege' })
  async bulkInvite(
    @Body() dto: BulkInviteDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    for (const item of dto.users) {
      const instId = item.institutionId || item.collegeId;
      const targetRole = item.role || Role.STUDENT;
      validateUserCreationRBAC(currentUser, targetRole, instId);
    }

    return this.usersService.bulkInvite(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  @ApiOperation({ summary: 'List users with pagination, filtering, and tenant isolation' })
  @ApiResponse({ status: 200, description: 'Paginated user list returned' })
  async getUsers(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    let targetInstId = query.institutionId || query.collegeId;

    if (!isSuperAdmin) {
      const adminInstitutionIds =
        currentUser.memberships
          ?.filter((m) => m.role === Role.INSTITUTION_ADMIN)
          .map((m) => m.institutionId) || [];

      if (adminInstitutionIds.length === 0) {
        throw new ForbiddenException('You do not have institution admin privileges');
      }

      if (targetInstId) {
        if (!adminInstitutionIds.includes(targetInstId)) {
          throw new ForbiddenException('You can only list users within your own institution');
        }
      } else {
        targetInstId = adminInstitutionIds[0];
      }
    }

    const normalizedSortOrder: 'asc' | 'desc' | undefined = query.sortOrder
      ? (String(query.sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc')
      : undefined;

    const paginationArgs = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: normalizedSortOrder,
    };

    return this.usersService.findPaginated(
      paginationArgs,
      query.role,
      query.status,
      targetInstId,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user sanitized profile' })
  async getMe(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getProfile(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  async getUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isSelf = currentUser.id === id;
    const isAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN ||
      currentUser.globalRole === Role.INSTITUTION_ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this user profile.');
    }

    if (currentUser.globalRole === Role.INSTITUTION_ADMIN && !isSelf) {
      const target = await this.usersService.findById(id);
      const targetMemberships = (target as (typeof target & {
        memberships?: Array<{ institutionId: string; role: Role }>;
      }) | null)?.memberships;

      const allowed = targetMemberships?.some((membership) =>
        currentUser.memberships?.some(
          (ownMembership) =>
            ownMembership.institutionId === membership.institutionId &&
            ownMembership.role === Role.INSTITUTION_ADMIN,
        ),
      );

      if (!allowed) {
        throw new ForbiddenException('You do not have permission to view this user profile.');
      }
      return target;
    }

    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile attributes with privilege checks' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (currentUser.id !== id && !isAdmin) {
      throw new ForbiddenException('You are not authorized to update another user profile');
    }

    if (!isAdmin) {
      if (
        dto.globalRole !== undefined ||
        dto.status !== undefined ||
        dto.contestRating !== undefined ||
        dto.ratingTier !== undefined ||
        dto.password !== undefined ||
        dto.email !== undefined
      ) {
        throw new ForbiddenException('You do not have permission to modify privileged user attributes');
      }
    }

    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete user account (Platform/Super Admin only)' })
  async deleteUser(@Param('id') id: string) {
    const success = await this.usersService.deleteUser(id);
    return { success, message: 'User deleted successfully' };
  }
}
