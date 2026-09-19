var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ProblemsResolver } from './problems.resolver.js';
import { ProblemsService } from './problems.service.js';
let ProblemsModule = class ProblemsModule {
};
ProblemsModule = __decorate([
    Module({
        providers: [ProblemsService, ProblemsResolver],
        exports: [ProblemsService],
    })
], ProblemsModule);
export { ProblemsModule };
//# sourceMappingURL=problems.module.js.map