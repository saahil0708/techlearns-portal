var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
let TopicSkillType = class TopicSkillType {
    name;
    solved;
    total;
    pct;
};
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], TopicSkillType.prototype, "name", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], TopicSkillType.prototype, "solved", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], TopicSkillType.prototype, "total", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], TopicSkillType.prototype, "pct", void 0);
TopicSkillType = __decorate([
    ObjectType('TopicSkill')
], TopicSkillType);
export { TopicSkillType };
let StudentSubmissionItemType = class StudentSubmissionItemType {
    id;
    problemTitle;
    problemSlug;
    problemCode;
    difficulty;
    language;
    verdict;
    runtimeMs;
    memoryKb;
    submittedAt;
    codeSnippet;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "problemTitle", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "problemSlug", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "problemCode", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "difficulty", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "language", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "verdict", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], StudentSubmissionItemType.prototype, "runtimeMs", void 0);
__decorate([
    Field(() => Int, { nullable: true }),
    __metadata("design:type", Number)
], StudentSubmissionItemType.prototype, "memoryKb", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "submittedAt", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentSubmissionItemType.prototype, "codeSnippet", void 0);
StudentSubmissionItemType = __decorate([
    ObjectType('StudentSubmissionItem')
], StudentSubmissionItemType);
export { StudentSubmissionItemType };
let StudentContestItemType = class StudentContestItemType {
    id;
    contestName;
    contestDate;
    rank;
    totalParticipants;
    score;
    penaltyTime;
    ratingDelta;
    newRating;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], StudentContestItemType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentContestItemType.prototype, "contestName", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentContestItemType.prototype, "contestDate", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentContestItemType.prototype, "rank", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentContestItemType.prototype, "totalParticipants", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentContestItemType.prototype, "score", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentContestItemType.prototype, "penaltyTime", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentContestItemType.prototype, "ratingDelta", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentContestItemType.prototype, "newRating", void 0);
StudentContestItemType = __decorate([
    ObjectType('StudentContestItem')
], StudentContestItemType);
export { StudentContestItemType };
let StudentCourseItemType = class StudentCourseItemType {
    id;
    title;
    slug;
    instructor;
    modulesCompleted;
    totalModules;
    progressPct;
    status;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], StudentCourseItemType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentCourseItemType.prototype, "title", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentCourseItemType.prototype, "slug", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentCourseItemType.prototype, "instructor", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentCourseItemType.prototype, "modulesCompleted", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentCourseItemType.prototype, "totalModules", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentCourseItemType.prototype, "progressPct", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentCourseItemType.prototype, "status", void 0);
StudentCourseItemType = __decorate([
    ObjectType('StudentCourseItem')
], StudentCourseItemType);
export { StudentCourseItemType };
let StudentProfileType = class StudentProfileType {
    id;
    name;
    handle;
    email;
    role;
    avatarUrl;
    bannerUrl;
    bio;
    institution;
    department;
    location;
    phone;
    joinedDate;
    githubUrl;
    linkedinUrl;
    websiteUrl;
    resumeUrl;
    resumeFileName;
    contestRating;
    ratingTier;
    globalRank;
    solvedTotal;
    solvedEasy;
    solvedMedium;
    solvedHard;
    totalSubmissions;
    accuracyRate;
    currentStreakDays;
    maxStreakDays;
    topics;
    submissions;
    contests;
    courses;
};
__decorate([
    Field(() => ID),
    __metadata("design:type", String)
], StudentProfileType.prototype, "id", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentProfileType.prototype, "name", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentProfileType.prototype, "handle", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "email", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentProfileType.prototype, "role", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "avatarUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "bannerUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "bio", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "institution", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "department", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "location", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "phone", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "joinedDate", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "githubUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "linkedinUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "websiteUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "resumeUrl", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], StudentProfileType.prototype, "resumeFileName", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "contestRating", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentProfileType.prototype, "ratingTier", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "globalRank", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "solvedTotal", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "solvedEasy", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "solvedMedium", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "solvedHard", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "totalSubmissions", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], StudentProfileType.prototype, "accuracyRate", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "currentStreakDays", void 0);
__decorate([
    Field(() => Int),
    __metadata("design:type", Number)
], StudentProfileType.prototype, "maxStreakDays", void 0);
__decorate([
    Field(() => [TopicSkillType]),
    __metadata("design:type", Array)
], StudentProfileType.prototype, "topics", void 0);
__decorate([
    Field(() => [StudentSubmissionItemType]),
    __metadata("design:type", Array)
], StudentProfileType.prototype, "submissions", void 0);
__decorate([
    Field(() => [StudentContestItemType]),
    __metadata("design:type", Array)
], StudentProfileType.prototype, "contests", void 0);
__decorate([
    Field(() => [StudentCourseItemType]),
    __metadata("design:type", Array)
], StudentProfileType.prototype, "courses", void 0);
StudentProfileType = __decorate([
    ObjectType('StudentProfile')
], StudentProfileType);
export { StudentProfileType };
//# sourceMappingURL=student-stats.type.js.map