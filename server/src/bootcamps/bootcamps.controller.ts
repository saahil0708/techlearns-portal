import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BootcampsService } from './bootcamps.service.js';
import { CreateBootcampDto } from './dto/create-bootcamp.dto.js';
import { QueryBootcampDto } from './dto/query-bootcamp.dto.js';
import { UpdateBootcampDto } from './dto/update-bootcamp.dto.js';
import { UpdateBootcampProgressDto } from './dto/update-progress.dto.js';

@ApiTags('bootcamps')
@Controller('bootcamps')
export class BootcampsController {
  constructor(private readonly bootcampsService: BootcampsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new sprint bootcamp' })
  @ApiResponse({ status: 201, description: 'Bootcamp created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBootcampDto,
  ) {
    return this.bootcampsService.createBootcamp(user.id, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all bootcamps with filters & search' })
  async findAll(
    @Query() query: QueryBootcampDto,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.bootcampsService.findAll(query, user?.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get bootcamp details by slug or id' })
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.bootcampsService.findBySlug(slug, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing bootcamp' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBootcampDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bootcampsService.updateBootcamp(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a bootcamp' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bootcampsService.deleteBootcamp(id, user);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enroll current user in a bootcamp' })
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bootcampsService.enroll(id, user.id);
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user bootcamp progress' })
  async updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateBootcampProgressDto,
  ) {
    return this.bootcampsService.updateProgress(id, user.id, dto);
  }
}
