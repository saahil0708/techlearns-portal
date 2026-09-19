export interface ApiResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    meta?: ApiResponseMeta;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    error: string;
    statusCode: number;
    errors?: unknown;
    timestamp: string;
    path: string;
}
