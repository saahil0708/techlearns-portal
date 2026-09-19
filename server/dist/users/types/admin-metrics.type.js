var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, Int, ObjectType } from '@nestjs/graphql';
let AdminMetricsType = class AdminMetricsType {
    institutionsCount;
    collegesCount;
    studentsCount;
    facultyCount;
    adminsCount;
    totalUsersCount;
    problemsCount;
    contestsCount;
    submissionsCount;
    systemStatus;
    uptimePercentage;
};
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "institutionsCount", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "collegesCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "studentsCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "facultyCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "adminsCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "totalUsersCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "problemsCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "contestsCount", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], AdminMetricsType.prototype, "submissionsCount", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], AdminMetricsType.prototype, "systemStatus", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], AdminMetricsType.prototype, "uptimePercentage", void 0);
AdminMetricsType = __decorate([
    ObjectType('AdminMetrics')
], AdminMetricsType);
export { AdminMetricsType };
//# sourceMappingURL=admin-metrics.type.js.map