export function notify(_msg: string) {}
export function notifySuccess(_msg: string) {}
export function notifyError(_msg: string) {}

// Lightweight UI notifications

export function notifyRateLimit(providerName?: string): void {
  const provider = providerName ? `（${providerName}）` : '';
  try {
    // Use sonner dynamically to avoid hard dependency in non-UI contexts

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

        console.warn('AI rate-limited. Please retry in a moment.', providerName || '');
      });
  } catch {
    // ignore
  }
}
