import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { InstitutionAccessGuard } from '../common/guards/institution-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateInstitutionDto } from './dto/create-institution.dto.js';
import { UpdateInstitutionDto } from './dto/update-institution.dto.js';
import { InstitutionsService } from './institutions.service.js';

@ApiTags('institutions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard)
@Controller(['institutions', 'colleges'])
export class InstitutionsController {
  constructor(private institutionsService: InstitutionsService) {}

  private assertInstitutionAdminAccess(
    user: CurrentUserPayload,
    targetInstitutionId: string,
    targetRole?: Role,
  ): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const membership = user.memberships?.find((m) => m.institutionId === targetInstitutionId);
    if (!membership || (membership.role !== Role.INSTITUTION_ADMIN && membership.role !== Role.FACULTY)) {
      throw new ForbiddenException('You do not have administrative or faculty access to this institution');
    }
    if (membership.role === Role.FACULTY && targetRole && targetRole !== Role.STUDENT) {
      throw new ForbiddenException('Faculty can only manage student memberships');
    }
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new institution organization' })
  @ApiResponse({ status: 201, description: 'Institution created successfully' })
  async create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List all institution organizations' })
  @ApiResponse({ status: 200, description: 'List of institutions' })
  async findAll() {
    return this.institutionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institution details by ID' })
  @ApiResponse({ status: 200, description: 'Institution details' })
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  @ApiOperation({ summary: 'Update institution details' })
  @ApiResponse({ status: 200, description: 'Institution updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete an institution organization' })
  @ApiResponse({ status: 200, description: 'Institution deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.institutionsService.delete(id);
  }

  @Post(':id/members')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Add or update a member in the institution' })
  @ApiResponse({ status: 201, description: 'Member assigned successfully' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertInstitutionAdminAccess(user, id, dto.role);
    let allowedTargetRole: Role | undefined;
    if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const membership = user.memberships?.find((m) => m.institutionId === id);
      if (membership?.role === Role.FACULTY) {
        allowedTargetRole = Role.STUDENT;
      }
    }
    return this.institutionsService.addMember(id, dto, allowedTargetRole);
  }

  @Get(':id/members')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all members in the institution' })
  @ApiResponse({ status: 200, description: 'List of institution members' })
  async getMembers(@Param('id') id: string) {
    return this.institutionsService.getMembers(id);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Remove a member from the institution' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertInstitutionAdminAccess(user, id);
    let allowedRole: Role | undefined;
    if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const membership = user.memberships?.find((m) => m.institutionId === id);
      if (membership?.role === Role.FACULTY) {
        allowedRole = Role.STUDENT;
      }
    }
    return this.institutionsService.removeMember(id, userId, allowedRole);
  }
}
