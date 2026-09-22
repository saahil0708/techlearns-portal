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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProblemDifficulty, ProblemStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { SetPotdDto } from './dto/set-potd.dto.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';
import { PotdService } from './potd.service.js';
import { ProblemsService } from './problems.service.js';

@ApiTags('problems')
@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly potdService: PotdService,
  ) {}

  @Get('potd/today')
  @ApiOperation({ summary: 'Get current Problem of the Day with streak info' })
  @ApiResponse({ status: 200, description: 'POTD problem details' })
  async getTodayPotd(@CurrentUser() user?: CurrentUserPayload) {
    return this.potdService.getPotd(undefined, user?.id);
  }

  @Post('potd/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set or schedule Problem of the Day for a specific date' })
  @ApiResponse({ status: 200, description: 'POTD set successfully' })
  async setPotd(
    @Body() input: SetPotdDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.potdService.setPotd(input.problemId, input.date, input.bonusPoints, user);
  }

  @Get('potd/history')
  @ApiOperation({ summary: 'Get recent history of Daily Problems' })
  @ApiResponse({ status: 200, description: 'List of historical POTD entries' })
  async getPotdHistory(
    @Query('days') days?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    const numDays = days ? Math.min(Math.max(parseInt(days, 10), 1), 60) : 14;
    return this.potdService.getPotdHistory(numDays, user?.id);
  }

  @Get('user/streak')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user daily solve streak, multiplier and calendar heatmap' })
  @ApiResponse({ status: 200, description: 'User streak details' })
  async getUserStreak(@CurrentUser() user: CurrentUserPayload) {
    return this.potdService.getUserStreak(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all published problems with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of problems' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('difficulty') difficulty?: ProblemDifficulty,
    @Query('status') status?: ProblemStatus,
    @Query('institutionId') institutionId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.problemsService.findPaginated(
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
      },
      difficulty,
      status,
      institutionId,
      user,
    );
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get problem details by ID or slug' })
  @ApiResponse({ status: 200, description: 'Problem entity' })
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.problemsService.findByIdOrSlug(idOrSlug, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new coding problem with test cases' })
  @ApiResponse({ status: 201, description: 'Problem created' })
  async create(
    @Body() input: CreateProblemInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.problemsService.create(input, user.id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing coding problem' })
  @ApiResponse({ status: 200, description: 'Problem updated' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateProblemInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.problemsService.update(id, input, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a coding problem' })
  @ApiResponse({ status: 200, description: 'Problem deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.problemsService.delete(id, user);
  }
}
