export declare class AssignStudentItemDto {
    userId: string;
    rollNo?: string;
}
export declare class AssignStudentsDto {
    userIds?: string[];
    students?: AssignStudentItemDto[];
}
