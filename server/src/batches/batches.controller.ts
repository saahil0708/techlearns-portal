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
import { InstitutionAccessGuard } from '../common/guards/institution-access.guard.js';
import { BatchAccessGuard } from '../common/guards/batch-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { BatchesService } from './batches.service.js';
import { AssignStudentsDto } from './dto/assign-students.dto.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';

@ApiTags('batches')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Post()
  @UseGuards(InstitutionAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Create a new student batch/cohort' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  async create(@Body() dto: CreateBatchDto) {
    return this.batchesService.create(dto);
  }

  @Get('institution/:institutionId')
  @UseGuards(InstitutionAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all batches in a specific institution' })
  @ApiResponse({ status: 200, description: 'List of batches' })
  async findByInstitution(@Param('institutionId') institutionId: string) {
    return this.batchesService.findByInstitution(institutionId);
  }

  @Get('college/:collegeId')
  @UseGuards(InstitutionAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all batches in a specific institution (legacy route)' })
  @ApiResponse({ status: 200, description: 'List of batches' })
  async findByCollege(@Param('collegeId') collegeId: string) {
    return this.batchesService.findByInstitution(collegeId);
  }

  @Get(':id')
  @UseGuards(BatchAccessGuard)
  @ApiOperation({ summary: 'Get batch details by ID' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  async findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(BatchAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Update batch details' })
  @ApiResponse({ status: 200, description: 'Batch updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(BatchAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Delete a batch' })
  @ApiResponse({ status: 200, description: 'Batch deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.batchesService.delete(id);
  }

  @Post(':id/students')
  @UseGuards(BatchAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Assign students to a batch' })
  @ApiResponse({ status: 201, description: 'Students assigned successfully' })
  async assignStudents(@Param('id') id: string, @Body() dto: AssignStudentsDto) {
    const assignments =
      dto.students && dto.students.length > 0
        ? dto.students
        : dto.userIds || [];
    return this.batchesService.assignStudents(id, assignments);
  }

  @Get(':id/students')
  @UseGuards(BatchAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all students assigned to a batch' })
  @ApiResponse({ status: 200, description: 'List of enrolled students' })
  async getStudents(@Param('id') id: string) {
    return this.batchesService.getStudents(id);
  }

  @Delete(':id/students/:userId')
  @UseGuards(BatchAccessGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Remove a student from a batch' })
  @ApiResponse({ status: 200, description: 'Student removed from batch successfully' })
  async removeStudent(@Param('id') id: string, @Param('userId') userId: string) {
    return this.batchesService.removeStudent(id, userId);
  }
}
