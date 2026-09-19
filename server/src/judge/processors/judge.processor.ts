import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  EVALUATE_SUBMISSION_JOB,
  EvaluateSubmissionJobData,
  JUDGE_QUEUE_NAME,
} from '../judge.constants.js';
import { JudgeService } from '../judge.service.js';

@Processor(JUDGE_QUEUE_NAME, {
  concurrency: 5,
})
export class JudgeProcessor extends WorkerHost {
  private readonly logger = new Logger(JudgeProcessor.name);

  constructor(private readonly judgeService: JudgeService) {
    super();
  }

  async process(job: Job<EvaluateSubmissionJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} (name: ${job.name}) for submission ${job.data.submissionId}`);

    if (job.name === EVALUATE_SUBMISSION_JOB || !job.name || job.name === '__default__') {
      await this.judgeService.evaluateSubmission(job.data.submissionId);
    } else {
      this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}

