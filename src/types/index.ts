export interface IPaginationParams {
    cursor?: string;
    limit?: number;
}

export interface IPaginationResult<T> {
    data: T[];
    meta: {
        hasNextPage: boolean;
        nextCursor?: string;
    }
}