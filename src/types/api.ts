export interface QueryError {
  message: string;
  code?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: QueryError;
}

export const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('not found');
  }
  return false;
};
