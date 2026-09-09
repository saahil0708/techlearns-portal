import { Module } from '@nestjs/common';
import { CollegesController } from './colleges.controller.js';
import { CollegesResolver } from './colleges.resolver.js';
import { CollegesService } from './colleges.service.js';

@Module({
  controllers: [CollegesController],
  providers: [CollegesService, CollegesResolver],
  exports: [CollegesService],
})
export class CollegesModule {}
