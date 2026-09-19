export declare class BatchStudentAssignmentItem {
    userId: string;
    rollNo?: string;
}
export declare class AssignStudentsInput {
    batchId: string;
    userIds?: string[];
    students?: BatchStudentAssignmentItem[];
}
