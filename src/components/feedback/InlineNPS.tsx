import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics';

interface InlineNPSProps {
  readonly storageKey?: string;
  readonly question?: string;
  readonly compact?: boolean;
}

const InlineNPS: React.FC<InlineNPSProps> = ({
  storageKey = 'nps:inline:last_answer',
  question = 'このアプリを友人や同僚に勧めたいですか？',
  compact = true,
}) => {
  const { trackEvent } = useAnalytics();
  const [score, setScore] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });

  const hidden = useMemo(() => {
    if (!submittedAt) return false;
    try {
      const last = new Date(submittedAt).getTime();
      // 再表示は14日後
      return Date.now() - last < 14 * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }, [submittedAt]);

  if (hidden) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-amber-900 font-medium">{question}</p>
            <p className="text-xs text-amber-800 mt-0.5">0（絶対に勧めない）〜 10（強く勧める）</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                className={`w-7 h-7 rounded text-xs font-semibold border ${
                  score === n
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                onClick={() => setScore(n)}
                aria-label={`NPSスコア ${n}`}
              >
                {n}
              </button>
            ))}
            <Button
              size="sm"
              disabled={score == null}
              onClick={() => {
                if (score == null) return;
                const now = new Date().toISOString();
                try {
                  localStorage.setItem(storageKey, now);
                } catch {}
                setSubmittedAt(now);
                trackEvent('nps_inline_submitted', {
                  score,
                  at: now,
                  path: window.location.pathname,
                });
              }}
              className="ml-2"
            >
              送信
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineNPS;
