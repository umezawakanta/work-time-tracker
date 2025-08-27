import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '@/lib/analytics';

type UrgeKind =
  | 'smoke'
  | 'alcohol'
  | 'coffee'
  | 'water'
  | 'phone'
  | 'adult'
  | 'hair'
  | 'beard'
  | 'earpick'
  | 'nosepick'
  | 'other';

interface GuardSettings {
  enabled: boolean;
  promptOnReturnMs: number; // if user returns after this, show check-in
}

const STORAGE_KEY_SETTINGS = 'pg_settings_v1';
const STORAGE_KEY_SNOOZE_UNTIL = 'pg_snooze_until_ms_v1';

function loadSettings(): GuardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw) as GuardSettings;
  } catch {}
  return { enabled: true, promptOnReturnMs: 60_000 };
}

function saveSettings(s: GuardSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
  } catch {}
}

function getSnoozeUntil(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY_SNOOZE_UNTIL) || 0) || 0;
  } catch {
    return 0;
  }
}

function setSnoozeUntil(ts: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNOOZE_UNTIL, String(ts));
  } catch {}
}

export const ProcrastinationGuard: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const [open, setOpen] = useState<boolean>(false);
  const [urge, setUrge] = useState<UrgeKind | null>(null);
  const [settings, setSettings] = useState<GuardSettings>(loadSettings);
  const [microTimerMs, setMicroTimerMs] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const lastHiddenAtRef = useRef<number>(0);

  const snoozed = useMemo(() => Date.now() < getSnoozeUntil(), []);

  const startMicroTimer = useCallback(
    (ms: number) => {
      setMicroTimerMs(ms);
      if (timerRef.current) window.clearInterval(timerRef.current);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const left = Math.max(0, ms - (Date.now() - startedAt));
        setMicroTimerMs(left);
        if (left <= 0 && timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
          try {
            trackEvent('pg_micro_timer_completed', {});
          } catch {}
        }
      }, 250) as unknown as number;
    },
    [trackEvent]
  );

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    []
  );

  // Visibility-based prompt
  useEffect(() => {
    const onVis = () => {
      if (!settings.enabled) return;
      const now = Date.now();
      if (document.visibilityState === 'hidden') {
        lastHiddenAtRef.current = now;
      } else {
        const awayMs = now - (lastHiddenAtRef.current || now);
        const snoozeUntil = getSnoozeUntil();
        if (awayMs >= settings.promptOnReturnMs && now >= snoozeUntil) {
          setUrge(null);
          setOpen(true);
          try {
            trackEvent('pg_prompt_return_from_background', { awayMs });
          } catch {}
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [settings.enabled, settings.promptOnReturnMs, trackEvent]);

  const onChooseUrge = (k: UrgeKind) => {
    setUrge(k);
    try {
      trackEvent('pg_urge_selected', { urge: k });
    } catch {}
  };

  const onCommitAlternative = (alt: string) => {
    try {
      trackEvent('pg_alternative_committed', { urge, alt });
    } catch {}
    // Default micro anchor: 2 minutes
    startMicroTimer(2 * 60_000);
    setOpen(false);
  };

  const onSnooze = (min: number) => {
    const until = Date.now() + min * 60_000;
    setSnoozeUntil(until);
    try {
      trackEvent('pg_snoozed', { minutes: min });
    } catch {}
    setOpen(false);
  };

  const onToggleEnabled = () => {
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    saveSettings(next);
    try {
      trackEvent('pg_enabled_toggled', { enabled: next.enabled });
    } catch {}
  };

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating action button */}
      {settings.enabled && (
        <button
          type="button"
          aria-label="衝動対策を開く"
          onClick={() => {
            setUrge(null);
            setOpen(true);
            try {
              trackEvent('pg_fab_open', {});
            } catch {}
          }}
          className="fixed bottom-20 right-4 z-40 rounded-full bg-amber-600 text-white shadow-lg px-4 py-3 text-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          衝動対策
        </button>
      )}

      {/* Micro anchor timer */}
      {microTimerMs > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-40 rounded bg-emerald-600 text-white px-3 py-2 shadow"
        >
          2分アンカー: {fmt(microTimerMs)}
          <button
            className="ml-2 underline"
            onClick={() => {
              setMicroTimerMs(0);
              try {
                trackEvent('pg_micro_timer_cancel', {});
              } catch {}
            }}
          >
            停止
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-lg rounded-lg bg-white text-gray-900 shadow-lg">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">先延ばし予防ガード</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3 text-sm">
              <div className="mb-2 text-gray-800">今からしようとしていることは？</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['smoke', 'タバコ'],
                    ['alcohol', 'お酒'],
                    ['coffee', 'コーヒー'],
                    ['water', '水だけ飲む'],
                    ['phone', 'スマホいじり'],
                    ['adult', 'アダルト'],
                    ['hair', '髪をさわる'],
                    ['beard', 'ひげをさわる'],
                    ['earpick', '耳かき'],
                    ['nosepick', '鼻ほじり'],
                    ['other', 'その他'],
                  ] as Array<[UrgeKind, string]>
                ).map(([k, label]) => (
                  <button
                    key={k}
                    className={`border rounded px-2 py-1 bg-white text-gray-800 hover:bg-gray-50 ${urge === k ? 'ring-2 ring-amber-400' : ''}`}
                    onClick={() => onChooseUrge(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-gray-800">代わりに今すぐできる最短の一歩は？</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  className="border rounded px-2 py-2 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onCommitAlternative('2分だけ最優先タスク')}
                >
                  2分だけ最優先タスク
                </button>
                <button
                  className="border rounded px-2 py-2 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onCommitAlternative('深呼吸30秒+水を一杯')}
                >
                  深呼吸30秒+水を一杯
                </button>
                <button
                  className="border rounded px-2 py-2 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onCommitAlternative('5分だけ歩く')}
                >
                  5分だけ歩く
                </button>
                <button
                  className="border rounded px-2 py-2 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onCommitAlternative('スマホは別室/裏返し')}
                >
                  スマホは別室/裏返し
                </button>
              </div>

              <div className="mt-4 text-gray-800">設定</div>
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={settings.enabled} onChange={onToggleEnabled} />
                  有効化
                </label>
                <label className="inline-flex items-center gap-2">
                  復帰時に促す:
                  <select
                    className="border rounded px-2 py-1"
                    value={String(settings.promptOnReturnMs)}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 60000;
                      const next = { ...settings, promptOnReturnMs: v };
                      setSettings(next);
                      saveSettings(next);
                      try {
                        trackEvent('pg_setting_prompt_return_ms', { value: v });
                      } catch {}
                    }}
                  >
                    <option value={60000}>1分</option>
                    <option value={120000}>2分</option>
                    <option value={300000}>5分</option>
                    <option value={0}>無効</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 text-gray-800">一時停止</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="border rounded px-2 py-1 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onSnooze(15)}
                >
                  15分停止
                </button>
                <button
                  className="border rounded px-2 py-1 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onSnooze(30)}
                >
                  30分停止
                </button>
                <button
                  className="border rounded px-2 py-1 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => onSnooze(60)}
                >
                  1時間停止
                </button>
              </div>
            </div>

            <div className="border-t px-4 py-3 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border rounded bg-white text-gray-800 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcrastinationGuard;
