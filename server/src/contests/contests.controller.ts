import {
  BadRequestException,
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
import { ContestStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PlagiarismService } from '../judge/plagiarism.service.js';
import { ComparativeLeaderboardService } from './comparative-leaderboard.service.js';
import { ContestsService } from './contests.service.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';

@ApiTags('contests')
@Controller('contests')
export class ContestsController {
  constructor(
    private readonly contestsService: ContestsService,
    private readonly comparativeLeaderboardService: ComparativeLeaderboardService,
    private readonly plagiarismService: PlagiarismService,
  ) {}

  @Post(':id/plagiarism-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Run MOSS/Winnowing plagiarism similarity detector across contest submissions' })
  @ApiResponse({ status: 200, description: 'Plagiarism similarity report' })
  async runPlagiarismCheck(
    @Param('id') id: string,
    @Query('threshold') threshold?: string,
  ) {
    let minThreshold = 80;
    if (threshold !== undefined && threshold !== null && threshold !== '') {
      const parsed = Number(threshold);
      if (!Number.isInteger(parsed) || isNaN(parsed) || parsed < 0 || parsed > 100) {
        throw new BadRequestException('Threshold must be an integer between 0 and 100');
      }
      minThreshold = parsed;
    }
    return this.plagiarismService.runContestPlagiarismCheck(id, minThreshold);
  }

  @Get('leaderboard/colleges')
  @ApiOperation({ summary: 'Get global inter-college leaderboard' })
  @ApiResponse({ status: 200, description: 'Inter-college comparative ranking' })
  async getCollegeLeaderboard() {
    return this.comparativeLeaderboardService.getCollegeLeaderboard();
  }

  @Get('leaderboard/batches/:institutionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get batch comparison leaderboard for an institution' })
  @ApiResponse({ status: 200, description: 'Batch comparative metrics' })
  async getBatchLeaderboard(
    @Param('institutionId') institutionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.comparativeLeaderboardService.getBatchLeaderboard(institutionId, user);
  }

  @Get(':id/matrix-leaderboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get START256 matrix contest leaderboard' })
  @ApiResponse({ status: 200, description: 'Contest matrix solve breakdown' })
  async getContestMatrixLeaderboard(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.comparativeLeaderboardService.getContestMatrixLeaderboard(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all contests with pagination and status filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of contests' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: ContestStatus,
    @Query('institutionId') institutionId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.contestsService.findPaginated(
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
      },
      status,
      institutionId,
      user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contest details by ID' })
  @ApiResponse({ status: 200, description: 'Contest entity' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.contestsService.findById(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new contest' })
  @ApiResponse({ status: 201, description: 'Contest created' })
  async create(
    @Body() input: CreateContestInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contestsService.create(input, user.id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing contest' })
  @ApiResponse({ status: 200, description: 'Contest updated' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateContestInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contestsService.update(id, input, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a contest' })
  @ApiResponse({ status: 200, description: 'Contest deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contestsService.delete(id, user);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register for a contest' })
  @ApiResponse({ status: 200, description: 'Registration completed' })
  async register(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contestsService.registerUser(id, user.id, user);
  }
}
