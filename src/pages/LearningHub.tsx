import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Rocket } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Course } from '@/types/learning';
import { saveProgress } from '@/services/api/assessmentsApi';
import { useAnalytics } from '@/lib/analytics';

const LearningHub: React.FC = () => {
  const { trackPageView, trackEvent } = useAnalytics();
  const [continueTomorrow, setContinueTomorrow] = useState<Record<string, boolean>>({});
  const courses: Array<
    Course & { desc: string; icon: React.ReactNode; progress?: number; next?: string }
  > = [
    {
      id: 'biz-101',
      title: 'ビジネス基礎 101',
      desc: '会計・マーケ・戦略の要点を最短で学ぶ',
      icon: <GraduationCap className="h-5 w-5 text-indigo-600" />,
      level: '入門',
      tags: ['会計', 'マーケ', '戦略'],
      progress: 30,
      next: '損益計算書の読み方（要点）',
    },
    {
      id: 'productivity',
      title: '生産性エンジン',
      desc: '時間管理・タスク分解・優先度設計の実践',
      icon: <Rocket className="h-5 w-5 text-purple-600" />,
      level: '実践',
      tags: ['時間管理', '優先度', 'タスク分解'],
      progress: 55,
      next: '4象限マトリクスのケース演習',
    },
    {
      id: 'reading',
      title: '要点読書術',
      desc: '重要ポイント抽出とAIサマリの組み合わせ',
      icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
      level: '実践',
      tags: ['要約', 'インプット'],
      progress: 10,
      next: 'SQ3Rのステップ（実践）',
    },
  ];

  useEffect(() => {
    trackPageView('/learning', 'Learning Hub');
  }, [trackPageView]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('learning:continueTomorrow');
      if (raw) setContinueTomorrow(JSON.parse(raw));
    } catch {}
  }, []);

  const persistTomorrow = (next: Record<string, boolean>) => {
    try {
      localStorage.setItem('learning:continueTomorrow', JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">学習ハブ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AIがあなたの特性に合わせてコースを最適化。ビジネススクールのエッセンスを効率的に学べます。
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="学習コース一覧">
        {courses.map((c) => (
          <Card key={c.id} className="bg-white/80 border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {c.icon}
                {c.title}
              </CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">{c.level}</Badge>
                <span className="text-xs text-gray-500">推奨: 15–30 分/日</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>進捗</span>
                  <span>{c.progress ?? 0}%</span>
                </div>
                <Progress value={c.progress ?? 0} />
              </div>
              {c.next && <div className="text-xs text-gray-600 mb-3">次に学ぶ: {c.next}</div>}
              <Button className="w-full" aria-label={`${c.title} を開始`}>
                開始
              </Button>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-2 py-0.5">
                    ⏱️ 次の1分タスク: {c.next || '次のセクションを1分だけ読む'}
                  </span>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="進捗を+10%保存"
                    onClick={() => {
                      const nextVal = Math.min(100, (c.progress ?? 0) + 10);
                      void saveProgress(c.id, nextVal).then(() => {
                        trackEvent('learning_progress_saved', {
                          courseId: c.id,
                          progress: nextVal,
                        });
                        // +10% 後に「明日も続ける」トグルを提示
                        setContinueTomorrow((prev) => {
                          const next = { ...prev, [c.id]: true };
                          persistTomorrow(next);
                          return next;
                        });
                      });
                    }}
                  >
                    進捗+10%保存
                  </Button>
                </div>
              </div>
              {continueTomorrow[c.id] && (
                <div className="mt-2 text-right">
                  <label className="text-xs text-gray-600 inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={continueTomorrow[c.id]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setContinueTomorrow((prev) => {
                          const next = { ...prev, [c.id]: checked };
                          persistTomorrow(next);
                          return next;
                        });
                        trackEvent('learning_continue_tomorrow_toggle', {
                          courseId: c.id,
                          enabled: checked,
                        });
                      }}
                      aria-label="明日も続ける"
                    />
                    明日も続ける
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default LearningHub;
