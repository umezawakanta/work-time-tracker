import React, { useEffect, useMemo, useState } from 'react';
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
  const total = useMemo(() => 20, []); // 骨組みとして20問想定（サンプルは少数）
  const { trackPageView, trackEvent } = useAnalytics();

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

  const unanswered = questions.filter((q) => selected[q.id] == null).length;
  const progress =
    questions.length > 0 ? ((questions.length - unanswered) / questions.length) * 100 : 0;

  const handleSelect = (qid: string, idx: number) => {
    setSelected((prev) => ({ ...prev, [qid]: idx }));
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

  const submit = async () => {
    if (questions.length === 0) return;
    const hasUnanswered = questions.some((q) => selected[q.id] == null);
    if (hasUnanswered) {
      toast.error('未選択の問題があります');
      return;
    }
    setSubmitting(true);
    try {
      const { raw, scaled, percentile } = computeScore();
      await saveIQResult({ score: raw, total: total, scaledIQ: scaled, percentile });
      toast.success(
        `結果を保存しました。推定IQ: ${scaled}（上位${Math.max(1, 100 - percentile)}%）`
      );
      trackEvent('assessment_saved', { type: 'iq', score: raw, scaled, percentile });
    } catch (e) {
      toast.error('保存に失敗しました');
      trackEvent('assessment_save_failed', { type: 'iq' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
