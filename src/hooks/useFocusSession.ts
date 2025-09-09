import { useState, useEffect, useCallback, useRef } from 'react';
import { saveSession } from '@/data/focus/db';

export type FocusState = 'idle' | 'running' | 'paused' | 'finished';

export interface FocusSessionData {
  state: FocusState;
  durationMs: number;
  remainingMs: number;
  startedAt: string | null;
  pausedAt: string[];
  interruptions: string[];
}

export interface FocusSessionActions {
  start: (durationMs: number) => void;
  pause: () => void;
  resume: () => void;
  finish: (payload: { rating: number; note?: string; tags: string[] }) => Promise<void>;
  reset: () => void;
  addInterruption: (tag: string) => void;
}

const QUICK_DURATIONS = {
  pomodoro: 25 * 60 * 1000, // 25分
  deep: 50 * 60 * 1000, // 50分
  marathon: 90 * 60 * 1000, // 90分
};

export const useFocusSession = (): FocusSessionData & FocusSessionActions => {
  const [state, setState] = useState<FocusState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [pausedAt, setPausedAt] = useState<string[]>([]);
  const [interruptions, setInterruptions] = useState<string[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // システム時刻基準で残り時間を計算
  const updateRemaining = useCallback(() => {
    if (state !== 'running' || !startedAt) return;

    const now = Date.now();
    const startTime = new Date(startedAt).getTime();
    const pausedDuration = pausedAt.reduce((total, pauseTime) => {
      const pauseStart = new Date(pauseTime).getTime();
      return total + (now - pauseStart);
    }, 0);

    const elapsed = now - startTime - pausedDuration;
    const remaining = Math.max(0, durationMs - elapsed);

    setRemainingMs(remaining);

    if (remaining <= 0) {
      setState('finished');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state, startedAt, durationMs, pausedAt]);

  // インターバル管理
  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(updateRemaining, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, updateRemaining]);

  // タブ切替/バックグラウンド対応
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state === 'running') {
        updateRemaining();
      }
    };

    const handleFocus = () => {
      if (state === 'running') {
        updateRemaining();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [state, updateRemaining]);

  const start = useCallback((newDurationMs: number) => {
    setDurationMs(newDurationMs);
    setRemainingMs(newDurationMs);
    setStartedAt(new Date().toISOString());
    setPausedAt([]);
    setInterruptions([]);
    setState('running');
  }, []);

  const pause = useCallback(() => {
    if (state === 'running') {
      setPausedAt((prev) => [...prev, new Date().toISOString()]);
      setState('paused');
    }
  }, [state]);

  const resume = useCallback(() => {
    if (state === 'paused') {
      setState('running');
    }
  }, [state]);

  const finish = useCallback(
    async (payload: { rating: number; note?: string; tags: string[] }) => {
      if (!startedAt) return;

      const sessionData = {
        startedAt,
        durationMs,
        interruptions,
        rating: payload.rating,
        note: payload.note,
        tags: payload.tags,
        completedAt: new Date().toISOString(),
        actualDurationMs: durationMs - remainingMs,
      };

      try {
        await saveSession(sessionData);
        setState('finished');
      } catch (error) {
        console.error('Failed to save focus session:', error);
      }
    },
    [startedAt, durationMs, interruptions, remainingMs]
  );

  const reset = useCallback(() => {
    setState('idle');
    setDurationMs(0);
    setRemainingMs(0);
    setStartedAt(null);
    setPausedAt([]);
    setInterruptions([]);
  }, []);

  const addInterruption = useCallback((tag: string) => {
    setInterruptions((prev) => [...prev, tag]);
  }, []);

  return {
    state,
    durationMs,
    remainingMs,
    startedAt,
    pausedAt,
    interruptions,
    start,
    pause,
    resume,
    finish,
    reset,
    addInterruption,
  };
};

export { QUICK_DURATIONS };
