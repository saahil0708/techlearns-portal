export const JUDGE_QUEUE_NAME = 'submission-queue';
export const EVALUATE_SUBMISSION_JOB = 'evaluate-submission';

export interface EvaluateSubmissionJobData {
  submissionId: string;
}
