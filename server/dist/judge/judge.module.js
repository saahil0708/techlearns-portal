var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JUDGE_QUEUE_NAME } from './judge.constants.js';
import { JudgeService } from './judge.service.js';
import { JudgeProcessor } from './processors/judge.processor.js';
let JudgeModule = class JudgeModule {
};
JudgeModule = __decorate([
    Module({
        imports: [
            PrismaModule,
            BullModule.registerQueue({
                name: JUDGE_QUEUE_NAME,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: 100,
                    removeOnFail: 500,
                },
            }),
        ],
        providers: [
            JudgeService,
            JudgeProcessor,
        ],
        exports: [
            JudgeService,
            BullModule,
        ],
    })
], JudgeModule);
export { JudgeModule };
//# sourceMappingURL=judge.module.js.map