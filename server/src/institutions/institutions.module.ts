import { Module } from '@nestjs/common';
import { InstitutionsController } from './institutions.controller.js';
import { InstitutionsResolver } from './institutions.resolver.js';
import { InstitutionsService } from './institutions.service.js';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, InstitutionsResolver],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
