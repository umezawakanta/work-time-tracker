import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { issueShortUrl } from '@/services/share/shortUrlStub';
import { buildShareUrl } from '@/services/share/referral';
import { Badge } from '@/components/ui/badge';

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
  const navigate = useNavigate();

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
      toast.error('未回答の設問があります。未回答の設問に移動しました。');
      try {
        const q = questions.find((qq) => selected[qq.id] == null);
        if (q) {
          const labelEl = document.getElementById(`mbti-${q.id}-label`);
          labelEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const radio = document.querySelector(`input[name="${q.id}"]`) as HTMLInputElement | null;
          radio?.focus();
        }
      } catch {}
      return;
    }
    setSubmitting(true);
    try {
      const result = compute();
      await saveMBTIResult({ type: result.type, scores: result.scores });
      toast.success(`あなたのタイプは ${result.type} です`);
      // 共有/AI反映/学習CTA
      const stub = issueShortUrl({
        kind: 'mbti',
        data: { type: result.type },
        issuedAt: Date.now(),
      });
      const aiUrl = buildShareUrl('/ai-assistant');
      const shareText = `MBTI結果: ${result.type}. 結果リンク: ${stub.url} \nAI秘書で次の一手 → ${aiUrl}`;
      toast.custom(
        (t) => (
          <div className="rounded-md border bg-white shadow px-4 py-3 text-sm flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({ title: 'MBTI結果', text: shareText });
                  } else {
                    await navigator.clipboard.writeText(shareText);
                    toast.success('結果をコピーしました');
                  }
                  (toast as any).dismiss((t as any).id);
                } catch {}
              }}
              className="inline-flex items-center px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              結果を共有
            </button>
            <button
              onClick={async () => {
                try {
                  const url = new URL(window.location.origin + '/assessments');
                  url.searchParams.set('ref', 'invite');
                  url.searchParams.set('utm_source', 'share');
                  if (navigator.share) {
                    await navigator.share({
                      title: '自己診断を試す',
                      text: 'あなたもやってみませんか？',
                      url: url.toString(),
                    });
                  } else {
                    await navigator.clipboard.writeText(url.toString());
                    toast.success('招待リンクをコピーしました');
                  }
                } catch (e) {
                  // ignore
                }
              }}
              className="inline-flex items-center px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
            >
              友だちを招待
            </button>
            <button
              onClick={() => {
                navigate('/ai-assistant');
                try {
                  (toast as any).dismiss((t as any).id);
                } catch {}
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
                } catch {}
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
        /* ignore */
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
                } catch {}
              }}
              className="ml-auto inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              AI秘書を開く
            </button>
          </div>
        ),
        { duration: 5000 }
      );
      trackEvent('assessment_saved', { type: 'mbti', mbti: result.type, scores: result.scores });
    } catch (e) {
      toast.error('結果の保存に失敗しました。再試行してください。');
      trackEvent('assessment_save_failed', { type: 'mbti' });
    } finally {
      setSubmitting(false);
    }
  };

  const resultPreview = questions.length > 0 && allAnswered ? compute() : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="sr-only">MBTI テスト</h1>
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
