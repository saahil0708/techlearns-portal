var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JUDGE_QUEUE_NAME } from '../judge/judge.constants.js';
import { SubmissionsResolver } from './submissions.resolver.js';
import { SubmissionsService } from './submissions.service.js';
let SubmissionsModule = class SubmissionsModule {
};
SubmissionsModule = __decorate([
    Module({
        imports: [
            BullModule.registerQueue({
                name: JUDGE_QUEUE_NAME,
            }),
        ],
        providers: [SubmissionsService, SubmissionsResolver],
        exports: [SubmissionsService],
    })
], SubmissionsModule);
export { SubmissionsModule };
//# sourceMappingURL=submissions.module.js.map