import { useCallback, useMemo, useRef, useState } from 'react';

export type AIActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ExecuteOptions {
  signal?: AbortSignal;
}

export interface UseAIActionOptions<TResult> {
  maxRetries?: number;
  retryDelayMs?: number;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
}

export interface UseAIActionReturn<TArgs, TResult> {
  status: AIActionStatus;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  result: TResult | null;
  attempt: number;
  startedAt: number | null;
  endedAt: number | null;
  durationMs: number | null;
  execute: (args: TArgs) => Promise<TResult | null>;
  retry: () => Promise<TResult | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Generic AI action hook with loading/error/retry states and cancellation.
 *
 * Example:
 * const ai = useAIAction(async (prompt, { signal }) => callAI(prompt, signal));
 * await ai.execute('hello');
 */
export function useAIAction<TArgs = void, TResult = unknown>(
  action: (args: TArgs, opts: { signal: AbortSignal }) => Promise<TResult>,
  options?: UseAIActionOptions<TResult>
): UseAIActionReturn<TArgs, TResult> {
  const { maxRetries = 0, retryDelayMs = 500, onSuccess, onError } = options || {};

  const [status, setStatus] = useState<AIActionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const [attempt, setAttempt] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);

  const lastArgsRef = useRef<TArgs | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const durationMs = useMemo(() => {
    if (startedAt != null && endedAt != null) return Math.max(0, endedAt - startedAt);
    return null;
  }, [startedAt, endedAt]);

  const startController = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    isCancelledRef.current = false;
    return controller;
  }, []);

  const normalizeError = useCallback((err: unknown): Error => {
    if (err instanceof Error) return err;
    try {
      return new Error(typeof err === 'string' ? err : JSON.stringify(err));
    } catch {
      return new Error('Unknown error');
    }
  }, []);

  const runWithRetry = useCallback(
    async (args: TArgs): Promise<TResult | null> => {
      let attemptIdx = 0;
      while (attemptIdx <= maxRetries) {
        const controller = startController();
        setAttempt(attemptIdx + 1);
        setStartedAt(Date.now());
        setEndedAt(null);
        setStatus('loading');
        setError(null);

        try {
          const value = await action(args, { signal: controller.signal });
          if (isCancelledRef.current) {
            // Treat as no-op if cancelled
            return null;
          }
          setResult(value);
          setEndedAt(Date.now());
          setStatus('success');
          onSuccess?.(value);
          return value;
        } catch (err) {
          const normalized = normalizeError(err);
          setError(normalized);
          setEndedAt(Date.now());
          setStatus('error');
          onError?.(normalized);

          if (attemptIdx < maxRetries) {
            // delay before retry
            await new Promise((res) => setTimeout(res, retryDelayMs));
            attemptIdx += 1;
            continue;
          }
          return null;
        }
      }
      return null;
    },
    [action, maxRetries, normalizeError, onError, onSuccess, retryDelayMs, startController]
  );

  const execute = useCallback(
    async (args: TArgs): Promise<TResult | null> => {
      lastArgsRef.current = args;
      setResult(null);
      return runWithRetry(args);
    },
    [runWithRetry]
  );

  const retry = useCallback(async (): Promise<TResult | null> => {
    if (lastArgsRef.current == null) return null;
    setResult(null);
    return runWithRetry(lastArgsRef.current);
  }, [runWithRetry]);

  const cancel = useCallback((): void => {
    isCancelledRef.current = true;
    controllerRef.current?.abort();
    setStatus((prev) => (prev === 'loading' ? 'idle' : prev));
  }, []);

  const reset = useCallback((): void => {
    isCancelledRef.current = false;
    controllerRef.current?.abort();
    setStatus('idle');
    setError(null);
    setResult(null);
    setAttempt(0);
    setStartedAt(null);
    setEndedAt(null);
    lastArgsRef.current = null;
  }, []);

  return {
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    result,
    attempt,
    startedAt,
    endedAt,
    durationMs,
    execute,
    retry,
    cancel,
    reset,
  };
}

export default useAIAction;
