/**
 * Extracts a message from an unknown error object.
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
