export function isRetryableProviderError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("timeout") ||
    message.includes("overloaded") ||
    message.includes("unavailable")
  );
}
