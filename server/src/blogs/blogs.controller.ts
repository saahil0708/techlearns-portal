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
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BlogsService } from './blogs.service.js';
import { CreateBlogCommentDto, CreateBlogDto } from './dto/create-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new blog article' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBlogDto,
  ) {
    return this.blogsService.createBlog(user.id, dto, user);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List all blog articles with filter & pagination' })
  async findAll(
    @Query() query: QueryBlogDto,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.blogsService.findAll(query, user);
  }

  @Get(':idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get single blog post details by ID or slug' })
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.blogsService.findOne(idOrSlug, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update blog article' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blogsService.updateBlog(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete blog article' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blogsService.deleteBlog(id, user);
  }

  @Post(':id/clap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clap / upvote a blog article' })
  async clap(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blogsService.clapBlog(id, user.id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment to a blog post' })
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBlogCommentDto,
  ) {
    return this.blogsService.addComment(id, user.id, dto);
  }

  @Patch(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a comment on a blog post' })
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBlogCommentDto,
  ) {
    return this.blogsService.updateComment(id, commentId, user.id, dto);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a comment on a blog post' })
  async removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blogsService.deleteComment(id, commentId, user.id);
  }
}
