export const AppEvents = {
  SUBMISSION_EVALUATED: 'submission.evaluated',
  USER_REGISTERED: 'user.registered',
  CONTEST_ACTIVITY: 'contest.activity',
  TELEMETRY_UPDATED: 'telemetry.updated',
} as const;

export class SubmissionEvaluatedEvent {
  constructor(
    public readonly submissionId: string,
    public readonly userId: string,
    public readonly problemId: string,
    public readonly verdict: string,
    public readonly passedTestCases: number,
    public readonly totalTestCases: number,
    public readonly contestId?: string | null,
  ) {}
}

export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class TelemetryUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly corporateId: string,
    public readonly passportScore: number,
    public readonly prsMerged: number,
  ) {}
}
