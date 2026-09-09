import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CollegeAccessGuard } from '../common/guards/college-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { BatchesService } from './batches.service.js';
import { AssignStudentsDto } from './dto/assign-students.dto.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';

@ApiTags('batches')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, CollegeAccessGuard)
@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  @ApiOperation({ summary: 'Create a new student batch/cohort' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  async create(@Body() dto: CreateBatchDto) {
    return this.batchesService.create(dto);
  }

  @Get('college/:collegeId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all batches in a specific college' })
  @ApiResponse({ status: 200, description: 'List of batches' })
  async findByCollege(@Param('collegeId') collegeId: string) {
    return this.batchesService.findByCollege(collegeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch details by ID' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  async findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  @ApiOperation({ summary: 'Update batch details' })
  @ApiResponse({ status: 200, description: 'Batch updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  @ApiOperation({ summary: 'Delete a batch' })
  @ApiResponse({ status: 200, description: 'Batch deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.batchesService.delete(id);
  }

  @Post(':id/students')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Assign students to a batch' })
  @ApiResponse({ status: 201, description: 'Students assigned successfully' })
  async assignStudents(@Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.batchesService.assignStudents(id, dto.userIds);
  }

  @Get(':id/students')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all students assigned to a batch' })
  @ApiResponse({ status: 200, description: 'List of enrolled students' })
  async getStudents(@Param('id') id: string) {
    return this.batchesService.getStudents(id);
  }

  @Delete(':id/students/:userId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  @ApiOperation({ summary: 'Remove a student from a batch' })
  @ApiResponse({ status: 200, description: 'Student removed from batch successfully' })
  async removeStudent(@Param('id') id: string, @Param('userId') userId: string) {
    return this.batchesService.removeStudent(id, userId);
  }
}
