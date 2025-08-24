import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Timer, Brain, TestTube, Target } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';

const AssessmentsHub: React.FC = () => {
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('/assessments', 'Assessments Hub');
  }, [trackPageView]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">自己診断ハブ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          IQ と MBTI
          の自己診断を通じて、あなたの特性に合わせた最適な学習・仕事スタイルを提案します。
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="outline" aria-label="受検時間の目安">
            <Timer className="h-3.5 w-3.5 mr-1" /> 各 5〜10 分
          </Badge>
          <Badge variant="outline" aria-label="プライバシー方針">
            <Shield className="h-3.5 w-3.5 mr-1" /> プライバシー保護
          </Badge>
          <Badge variant="outline" aria-label="用途">
            <Target className="h-3.5 w-3.5 mr-1" /> 個別最適化に活用
          </Badge>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="診断メニュー">
        {/* IQ Test Card */}
        <Card className="bg-white/80 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" /> IQ テスト
            </CardTitle>
            <CardDescription>
              認知処理の傾向を把握し、仕事術や学習計画に活かすための簡易テストです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-700 space-y-2 mb-4">
              <li>・所要時間の目安: 5〜10 分</li>
              <li>・結果はローカル保存と個別最適化にのみ使用</li>
              <li>・後から削除・再受検が可能</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => navigate('/iq-test')}
              aria-label="IQテストを開始"
            >
              開始
            </Button>
          </CardContent>
        </Card>

        {/* MBTI Test Card */}
        <Card className="bg-white/80 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" /> MBTI テスト
            </CardTitle>
            <CardDescription>
              性格タイプを把握し、コミュニケーションやタスク配分の最適化に役立てます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-700 space-y-2 mb-4">
              <li>・所要時間の目安: 5〜10 分</li>
              <li>・個人を特定しない形での分析にのみ活用</li>
              <li>・推奨ワークスタイルを自動提案</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => navigate('/mbti-test')}
              aria-label="MBTIテストを開始"
            >
              開始
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AssessmentsHub;
