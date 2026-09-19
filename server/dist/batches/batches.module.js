var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller.js';
import { BatchesResolver } from './batches.resolver.js';
import { BatchesService } from './batches.service.js';
import { BatchAccessGuard } from '../common/guards/batch-access.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
let BatchesModule = class BatchesModule {
};
BatchesModule = __decorate([
    Module({
        controllers: [BatchesController],
        providers: [BatchesService, BatchesResolver, BatchAccessGuard, PrismaService],
        exports: [BatchesService],
    })
], BatchesModule);
export { BatchesModule };
//# sourceMappingURL=batches.module.js.map