import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import {
  deriveMBTIType,
  type MBTIDimension,
  type MBTILetter,
  type MBTIResult,
} from '@/services/assessments/mbti';
import { saveMBTIResult } from '@/services/api/assessmentsApi';
import { useAnalytics } from '@/lib/analytics';

interface MBTIQuestion {
  id: string;
  dimension: MBTIDimension;
  towards: MBTILetter;
  text: string;
  choices: string[];
}

const loadQuestions = async (): Promise<MBTIQuestion[]> => {
  const mod = await import('@/data/mbti-questions.json');
  return (mod as any).default as MBTIQuestion[];
};

const MBTITest: React.FC = () => {
  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [selected, setSelected] = useState<Record<string, 1 | 2 | 3 | 4 | 5 | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const { trackPageView, trackEvent } = useAnalytics();

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => selected[q.id] != null),
    [questions, selected]
  );

  useEffect(() => {
    loadQuestions().then((q) => setQuestions(q));
  }, []);

  useEffect(() => {
    trackPageView('/mbti-test', 'MBTI Test');
  }, [trackPageView]);

  const handleSelect = (qid: string, idx: number) => {
    const val = (idx + 1) as 1 | 2 | 3 | 4 | 5;
    setSelected((prev) => ({ ...prev, [qid]: val }));
  };

  const compute = (): MBTIResult => {
    const answers = questions.map((q) => ({
      questionId: q.id,
      dimension: q.dimension,
      towards: q.towards,
      choice: (selected[q.id] ?? 3) as 1 | 2 | 3 | 4 | 5,
    }));
    return deriveMBTIType(answers as any);
  };

  const submit = async () => {
    if (!allAnswered) {
      toast.error('未回答の設問があります');
      return;
    }
    setSubmitting(true);
    try {
      const result = compute();
      await saveMBTIResult({ type: result.type, scores: result.scores });
      toast.success(`あなたのタイプは ${result.type} です`);
      trackEvent('assessment_saved', { type: 'mbti', mbti: result.type, scores: result.scores });
    } catch (e) {
      toast.error('結果の保存に失敗しました');
      trackEvent('assessment_save_failed', { type: 'mbti' });
    } finally {
      setSubmitting(false);
    }
  };

  const resultPreview = questions.length > 0 && allAnswered ? compute() : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>MBTI テスト（最小版）</CardTitle>
          <CardDescription>各設問に当てはまる度合いを選択してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <fieldset key={q.id} className="border rounded p-4 bg-white">
                <legend id={`mbti-${q.id}-label`} className="font-medium mb-2">
                  Q{idx + 1}. {q.text}
                </legend>
                <div
                  className="grid grid-cols-1 md:grid-cols-5 gap-2"
                  role="radiogroup"
                  aria-labelledby={`mbti-${q.id}-label`}
                >
                  {q.choices.map((label, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected[q.id] === i + 1}
                        onChange={() => handleSelect(q.id, i)}
                        aria-label={label}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            {questions.length === 0 && (
              <Alert>
                <AlertDescription>
                  設問データの読み込み中、またはサンプル不足です。
                </AlertDescription>
              </Alert>
            )}

            {/* Result card (preview) */}
            {resultPreview && (
              <div className="border rounded p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-lg font-bold mb-1">推定タイプ: {resultPreview.type}</div>
                <div className="text-sm text-gray-700 mb-2">
                  EI: {resultPreview.scores.EI} / SN: {resultPreview.scores.SN} / TF:{' '}
                  {resultPreview.scores.TF} / JP: {resultPreview.scores.JP}
                </div>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>サマリ: あなたの傾向に合わせた意思決定・情報処理スタイルを把握できます。</li>
                  <li>注意点: タイプは絶対ではありません。状況や学習で変化します。</li>
                  <li>学習提案: 自分と異なるタイプの視点を取り入れ、幅を広げましょう。</li>
                </ul>
              </div>
            )}

            <div className="text-right">
              <Button onClick={() => void submit()} disabled={submitting || questions.length === 0}>
                {submitting ? '保存中...' : '結果を保存'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MBTITest;
