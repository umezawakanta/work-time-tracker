import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { calculateIQScore, type IQAnswer } from '@/services/assessments/iq';
import { saveIQResult } from '@/services/api/assessmentsApi';
import { useAnalytics } from '@/lib/analytics';

interface IQQuestion {
  id: string;
  text: string;
  choices: string[];
  answerIndex: number;
}

const loadQuestions = async (): Promise<IQQuestion[]> => {
  const mod = await import('@/data/iq-questions.json');
  // Vite will import JSON as default
  return (mod as any).default as IQQuestion[];
};

const TOTAL_TIME_SEC = 10 * 60; // 10分

const IQTest: React.FC = () => {
  const [questions, setQuestions] = useState<IQQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SEC);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const total = useMemo(() => 20, []); // 骨組みとして20問想定（サンプルは少数）
  const { trackPageView, trackEvent } = useAnalytics();
  const navigate = useNavigate();
  const firstUnansweredRef = useRef<string | null>(null);

  useEffect(() => {
    loadQuestions()
      .then((q) => setQuestions(q))
      .finally(() => setLoadingQuestions(false));
  }, []);

  useEffect(() => {
    trackPageView('/iq-test', 'IQ Test');
  }, [trackPageView]);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft === 0 && !submitting && !autoSubmitted) {
      setAutoSubmitted(true);
      // 未回答は不正解として自動提出
      toast('時間になりました。自動的に提出します。', { icon: '⏰' });
      void submit({ allowIncomplete: true, reason: 'timeout' });
    }
  }, [timeLeft, started, submitting, autoSubmitted]);

  const unanswered = questions.filter((q) => selected[q.id] == null).length;
  const progress =
    questions.length > 0 ? ((questions.length - unanswered) / questions.length) * 100 : 0;

  const handleSelect = (qid: string, idx: number) => {
    setSelected((prev) => ({ ...prev, [qid]: idx }));
  };

  const scrollToFirstUnanswered = () => {
    const q = questions.find((qq) => selected[qq.id] == null);
    if (!q) return;
    try {
      const labelEl = document.getElementById(`q-${q.id}-label`);
      labelEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const radio = document.querySelector(`input[name="${q.id}"]`) as HTMLInputElement | null;
      radio?.focus();
      firstUnansweredRef.current = q.id;
    } catch (e) {
      console.warn('Failed to scroll/focus first unanswered question:', e);
    }
  };

  const computeScore = (): {
    answers: IQAnswer[];
    raw: number;
    scaled: number;
    percentile: number;
  } => {
    const answers: IQAnswer[] = questions.map((q) => ({
      questionId: q.id,
      correct: selected[q.id] === q.answerIndex,
    }));
    const result = calculateIQScore(answers, total);
    return {
      answers,
      raw: result.rawScore,
      scaled: result.scaledIQ,
      percentile: result.percentile,
    };
  };

  const submit = async (opts?: { allowIncomplete?: boolean; reason?: 'timeout' | 'user' }) => {
    if (questions.length === 0) return;
    const hasUnanswered = questions.some((q) => selected[q.id] == null);
    if (hasUnanswered && !opts?.allowIncomplete) {
      toast.error('未回答の設問があります。未回答の設問へ移動しました。');
      scrollToFirstUnanswered();
      return;
    }
    setSubmitting(true);
    try {
      const { raw, scaled, percentile } = computeScore();
      await saveIQResult({ score: raw, total: total, scaledIQ: scaled, percentile });
      toast.success(
        `結果を保存しました（推定IQ: ${scaled} / 上位${Math.max(1, 100 - percentile)}%）`
      );
      // 共有/AI反映/学習CTA
      const shareText = `IQテスト結果: 推定IQ ${scaled}（上位${Math.max(1, 100 - percentile)}%）。\nAI秘書で次の一手を作る → ${window.location.origin}/ai-assistant`;
      toast.custom(
        (t) => (
          <div className="rounded-md border bg-white shadow px-4 py-3 text-sm flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({ title: 'IQテスト結果', text: shareText });
                  } else {
                    await navigator.clipboard.writeText(shareText);
                    toast.success('結果をコピーしました');
                  }
                  (toast as any).dismiss((t as any).id);
                } catch (err) {
                  console.debug('Share/copy dismissed error', err);
                }
              }}
              className="inline-flex items-center px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              結果を共有
            </button>
            <button
              onClick={() => {
                navigate('/ai-assistant');
                try {
                  (toast as any).dismiss((t as any).id);
                } catch (err) {
                  console.debug('Dismiss error', err);
                }
              }}
              className="inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              AIに反映
            </button>
            <button
              onClick={() => {
                navigate('/learning');
                try {
                  (toast as any).dismiss((t as any).id);
                } catch (err) {
                  console.debug('Dismiss error', err);
                }
              }}
              className="inline-flex items-center px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              学習を始める
            </button>
          </div>
        ),
        { duration: 6000 }
      );
      try {
        localStorage.setItem('next_step_card', 'true');
      } catch (e) {
        console.debug('Failed to set next_step_card flag', e);
      }
      // 提案: AI秘書で反映
      toast.custom(
        (t) => (
          <div className="rounded-md border bg-white shadow px-4 py-3 text-sm flex items-center gap-3">
            <span>AI秘書に結果を反映しますか？</span>
            <button
              onClick={() => {
                navigate('/ai-assistant');
                try {
                  (toast as any).dismiss((t as any).id);
                } catch (e) {
                  // ignore
                }
              }}
              className="ml-auto inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              AI秘書を開く
            </button>
          </div>
        ),
        { duration: 5000 }
      );
      trackEvent('assessment_saved', { type: 'iq', score: raw, scaled, percentile });
    } catch (e) {
      toast.error('結果の保存に失敗しました。通信環境をご確認ください。');
      trackEvent('assessment_save_failed', { type: 'iq' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="sr-only">IQ テスト</h1>
      <Card>
        <CardHeader>
          <CardTitle>IQ テスト（最小版）</CardTitle>
          <CardDescription>制限時間: 10分。すべての問題に回答してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              残り時間: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <div className="w-48">
              <Progress value={progress} />
            </div>
          </div>

          {!started ? (
            <div className="space-y-4">
              {loadingQuestions ? (
                <div className="space-y-3" aria-busy="true" aria-live="polite">
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : (
                <div className="text-center">
                  <p id="iq-test-desc" className="text-sm text-gray-600 mb-3">
                    各問題につき選択肢を1つ選んでください。
                  </p>
                  <Button onClick={() => setStarted(true)} aria-describedby="iq-test-desc">
                    開始
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <fieldset key={q.id} className="border rounded p-4 bg-white">
                  <legend id={`q-${q.id}-label`} className="font-semibold mb-2">
                    Q{idx + 1}. {q.text}
                  </legend>
                  <p id={`q-${q.id}-desc`} className="text-xs text-gray-600 mb-2">
                    最も適切だと思うものを1つ選んでください。
                  </p>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    role="radiogroup"
                    aria-labelledby={`q-${q.id}-label`}
                    aria-describedby={`q-${q.id}-desc`}
                  >
                    {q.choices.map((c, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={selected[q.id] === i}
                          onChange={() => handleSelect(q.id, i)}
                          aria-label={`選択肢 ${i + 1}`}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {questions.length === 0 && (
                <Alert>
                  <AlertDescription>
                    問題データの読み込み中、またはサンプル不足です。
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-right">
                <Button
                  onClick={() => void submit()}
                  disabled={submitting || questions.length === 0}
                  aria-label="結果を保存"
                >
                  {submitting ? '保存中...' : '結果を保存'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IQTest;
