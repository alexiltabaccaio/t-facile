/**
 * Extracts a message from an unknown error object.
 * Useful for catch blocks where the error is of type 'unknown'.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Checks if a variable is an Error object.
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
