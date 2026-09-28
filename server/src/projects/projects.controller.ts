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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateProjectDto, ToggleMilestoneDto } from './dto/create-project.dto.js';
import { QueryProjectDto } from './dto/query-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student project sandbox' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(user.id, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all student projects with filtering' })
  async findAll(
    @Query() query: QueryProjectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.projectsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single project details by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.projectsService.updateProject(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student project' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.projectsService.deleteProject(id, user);
  }

  @Patch(':id/milestones/:milestoneId/toggle')
  @ApiOperation({ summary: 'Toggle milestone completion status' })
  async toggleMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto?: ToggleMilestoneDto,
  ) {
    if (dto && dto.done !== undefined && typeof dto.done !== 'boolean') {
      throw new BadRequestException('done must be a boolean value');
    }
    return this.projectsService.toggleMilestone(id, milestoneId, user, dto?.done);
  }
}
