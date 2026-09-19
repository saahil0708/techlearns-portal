import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EvaluateSubmissionJobData } from '../judge.constants.js';
import { JudgeService } from '../judge.service.js';
export declare class JudgeProcessor extends WorkerHost {
    private readonly judgeService;
    private readonly logger;
    constructor(judgeService: JudgeService);
    process(job: Job<EvaluateSubmissionJobData>): Promise<void>;
}
