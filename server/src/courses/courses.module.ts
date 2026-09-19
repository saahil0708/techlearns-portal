import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesResolver } from './courses.resolver.js';
import { CoursesService } from './courses.service.js';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}
