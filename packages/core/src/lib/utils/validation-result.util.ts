export function isValidationFailure(result: unknown): result is { message: string } {
  return !!result && typeof result === 'object' && 'message' in (result as { message?: string })
    && typeof (result as { message?: string }).message === 'string';
}
