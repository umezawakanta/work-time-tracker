// Lightweight UI notifications

export function notifyRateLimit(providerName?: string): void {
  const provider = providerName ? `（${providerName}）` : '';
  try {
    // Use sonner dynamically to avoid hard dependency in non-UI contexts
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import('sonner')
      .then(({ toast }) => {
        toast.warning(
          `AIのリクエストが一時的に制限されています${provider}。数十秒後に再試行してください。`,
          {
            duration: 5000,
          }
        );
      })
      .catch(() => {
        // Fallback: console
        // eslint-disable-next-line no-console
        console.warn('AI rate-limited. Please retry in a moment.', providerName || '');
      });
  } catch {
    // ignore
  }
}
