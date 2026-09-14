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
import { CollegeAccessGuard } from '../common/guards/college-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CollegesService } from './colleges.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateCollegeDto } from './dto/create-college.dto.js';
import { UpdateCollegeDto } from './dto/update-college.dto.js';

@ApiTags('colleges')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, CollegeAccessGuard)
@Controller('colleges')
export class CollegesController {
  constructor(private collegesService: CollegesService) {}

  private assertCollegeAdminAccess(
    user: CurrentUserPayload,
    targetCollegeId: string,
    targetRole?: Role,
  ): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const membership = user.memberships?.find((m) => m.collegeId === targetCollegeId);
    if (!membership || (membership.role !== Role.COLLEGE_ADMIN && membership.role !== Role.FACULTY)) {
      throw new ForbiddenException('You do not have administrative or faculty access to this college');
    }
    if (membership.role === Role.FACULTY && targetRole && targetRole !== Role.STUDENT) {
      throw new ForbiddenException('Faculty can only manage student memberships');
    }
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new college organization' })
  @ApiResponse({ status: 201, description: 'College created successfully' })
  async create(@Body() dto: CreateCollegeDto) {
    return this.collegesService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List all college organizations' })
  @ApiResponse({ status: 200, description: 'List of colleges' })
  async findAll() {
    return this.collegesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get college details by ID' })
  @ApiResponse({ status: 200, description: 'College details' })
  async findOne(@Param('id') id: string) {
    return this.collegesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  @ApiOperation({ summary: 'Update college details' })
  @ApiResponse({ status: 200, description: 'College updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateCollegeDto) {
    return this.collegesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a college organization' })
  @ApiResponse({ status: 200, description: 'College deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.collegesService.delete(id);
  }

  @Post(':id/members')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Add or update a member in the college' })
  @ApiResponse({ status: 201, description: 'Member assigned successfully' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertCollegeAdminAccess(user, id, dto.role);
    let allowedTargetRole: Role | undefined;
    if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const membership = user.memberships?.find((m) => m.collegeId === id);
      if (membership?.role === Role.FACULTY) {
        allowedTargetRole = Role.STUDENT;
      }
    }
    return this.collegesService.addMember(id, dto, allowedTargetRole);
  }

  @Get(':id/members')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all members in the college' })
  @ApiResponse({ status: 200, description: 'List of college members' })
  async getMembers(@Param('id') id: string) {
    return this.collegesService.getMembers(id);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Remove a member from the college' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertCollegeAdminAccess(user, id);
    let allowedRole: Role | undefined;
    if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const membership = user.memberships?.find((m) => m.collegeId === id);
      if (membership?.role === Role.FACULTY) {
        allowedRole = Role.STUDENT;
      }
    }
    return this.collegesService.removeMember(id, userId, allowedRole);
  }
}
