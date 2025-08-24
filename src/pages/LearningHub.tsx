import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Rocket } from 'lucide-react';

const LearningHub: React.FC = () => {
  const courses = [
    {
      id: 'biz-101',
      title: 'ビジネス基礎 101',
      desc: '会計・マーケ・戦略の要点を最短で学ぶ',
      icon: <GraduationCap className="h-5 w-5 text-indigo-600" />,
      level: '入門',
    },
    {
      id: 'productivity',
      title: '生産性エンジン',
      desc: '時間管理・タスク分解・優先度設計の実践',
      icon: <Rocket className="h-5 w-5 text-purple-600" />,
      level: '実践',
    },
    {
      id: 'reading',
      title: '要点読書術',
      desc: '重要ポイント抽出とAIサマリの組み合わせ',
      icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
      level: '実践',
    },
  ];

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
              <Button className="w-full" aria-label={`${c.title} を開始`}>
                開始
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default LearningHub;
