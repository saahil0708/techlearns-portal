import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BootcampsController } from './bootcamps.controller.js';
import { BootcampsService } from './bootcamps.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [BootcampsController],
  providers: [BootcampsService],
  exports: [BootcampsService],
})
export class BootcampsModule {}
