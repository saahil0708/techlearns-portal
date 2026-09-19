import { ProblemType } from '../../problems/types/problem.type.js';
export declare class ContestProblemType {
    id: string;
    contestId: string;
    problemId: string;
    points: number;
    order: number;
    problem?: ProblemType;
}
