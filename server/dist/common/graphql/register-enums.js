import { registerEnumType } from '@nestjs/graphql';
import { ContestStatus, CourseStatus, EnrollmentStatus, InstitutionStatus, ProblemDifficulty, ProblemStatus, ProgrammingLanguage, Role, SubmissionStatus, SubmissionVerdict, UserStatus, } from '@prisma/client';
export function registerGraphQLEnums() {
    registerEnumType(Role, {
        name: 'Role',
        description: 'System-wide and institution user roles',
    });
    registerEnumType(UserStatus, {
        name: 'UserStatus',
        description: 'Account activation status',
    });
    registerEnumType(InstitutionStatus, {
        name: 'InstitutionStatus',
        description: 'Higher-ed and school organization status',
    });
    registerEnumType(CourseStatus, {
        name: 'CourseStatus',
        description: 'Curriculum course lifecycle status',
    });
    registerEnumType(EnrollmentStatus, {
        name: 'EnrollmentStatus',
        description: 'Student course enrollment status',
    });
    registerEnumType(ProblemDifficulty, {
        name: 'ProblemDifficulty',
        description: 'Problem difficulty rating',
    });
    registerEnumType(ProblemStatus, {
        name: 'ProblemStatus',
        description: 'Coding problem publication status',
    });
    registerEnumType(ProgrammingLanguage, {
        name: 'ProgrammingLanguage',
        description: 'Supported code execution programming languages',
    });
    registerEnumType(SubmissionStatus, {
        name: 'SubmissionStatus',
        description: 'Judge evaluation pipeline status',
    });
    registerEnumType(SubmissionVerdict, {
        name: 'SubmissionVerdict',
        description: 'Evaluation test outcome verdict',
    });
    registerEnumType(ContestStatus, {
        name: 'ContestStatus',
        description: 'Competitive contest lifecycle status',
    });
}
//# sourceMappingURL=register-enums.js.map