/**
 * Error handling utilities for type-safe error management
 */

export interface AppError {
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
}

/**
 * Type guard to check if error is an Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
};

/**
 * Safely extract error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isError(error)) {
    return error.message;
  }

  if (isAppError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error occurred';
};

/**
 * Create a standardized error object
 */
export const createAppError = (message: string, code?: string, details?: unknown): AppError => ({
  message,
  code,
  details,
});

/**
 * Async error handler wrapper
 */
export const withErrorHandling = <T extends readonly unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw createAppError(errorMessage, 'EXECUTION_ERROR', error);
    }
  };
};
