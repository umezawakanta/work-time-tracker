import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADHDFocusHelper } from '@/components/adhd/ADHDFocusHelper';
import adhdService, { ADHDProgress, ADHDInsight } from '@/services/adhdService';
import {
  Brain,
  Target,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Heart,
  Shield,
  TrendingUp,
  BarChart3,
  Settings,
} from 'lucide-react';

export const ADHDSupportPage: React.FC = () => {
  const [progress, setProgress] = useState<ADHDProgress | null>(null);
  const [insights, setInsights] = useState<ADHDInsight[]>([]);
  const [showQuickTips, setShowQuickTips] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>(
    'weekly'
  );

  // データ読み込み
  useEffect(() => {
    const loadData = () => {
      const progressData = adhdService.getProgress();
      const insightsData = adhdService.generateInsights();

      setProgress(progressData);
      setInsights(insightsData);
    };

    loadData();

    // サービスのイベントリスナー
    const handleProgressUpdate = (newProgress: ADHDProgress) => {
      setProgress(newProgress);
    };

    adhdService.on('progressUpdated', handleProgressUpdate);
    adhdService.on('sessionCompleted', loadData);
    adhdService.on('thoughtSaved', loadData);

    return () => {
      adhdService.off('progressUpdated', handleProgressUpdate);
      adhdService.off('sessionCompleted', loadData);
      adhdService.off('thoughtSaved', loadData);
    };
  }, []);

  // クイックアクション
  const quickActions = [
    {
      title: '緊急現実チェック',
      description: '今すぐ妄想から現実に戻る',
      icon: <Shield className="h-5 w-5" />,
      action: () =>
        alert('深呼吸して、今いる場所を見回してください。5つのものを名前で言ってみましょう。'),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: '2分集中タイマー',
      description: '短時間の集中練習',
      icon: <Clock className="h-5 w-5" />,
      action: () => {
        const timer = setTimeout(
          () => {
            alert('2分完了！よくできました！');
          },
          2 * 60 * 1000
        );
        alert('2分タイマー開始！今のタスクに集中してください。');
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: '思考整理',
      description: '頭の中を整理する',
      icon: <Brain className="h-5 w-5" />,
      action: () => {
        const thought = prompt('今考えていることを書いてください：');
        if (thought) {
          alert(
            `記録しました：「${thought}」\n\nこれは現実的な考えですか？今やるべきことに関係ありますか？`
          );
        }
      },
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  // ADHD向けのヒント
  const adhdTips = [
    {
      category: '集中力',
      tips: [
        '25分作業 + 5分休憩のポモドーロテクニックを使う',
        'スマホを別の部屋に置く',
        '作業前に机の上を片付ける',
        'BGMは歌詞のないものを選ぶ',
      ],
    },
    {
      category: '妄想対策',
      tips: [
        '「これは今の現実？」と自分に問いかける',
        '思考を紙に書き出して客観視する',
        '10分ごとにアラームを設定して現実チェック',
        '完璧主義をやめ、「まずは始める」を心がける',
      ],
    },
    {
      category: 'タスク管理',
      tips: [
        '大きなタスクを小さく分割する',
        '優先度を3段階で分ける（高・中・低）',
        '完了したタスクにチェックを入れる達成感を味わう',
        '明日のタスクを前日に3つだけ決める',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          🧠 ADHDサポートセンター
        </h1>
        <p className="text-gray-600">集中力向上と妄想防止のための総合サポート</p>
      </div>

      {/* 統計ダッシュボード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress?.totalSessions || 0}</div>
              <div className="text-sm text-gray-600">集中セッション</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progress?.averageSessionLength || 0)}分
              </div>
              <div className="text-sm text-gray-600">平均集中時間</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progress?.totalThoughtsAnalyzed || 0}
              </div>
              <div className="text-sm text-gray-600">思考分析回数</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(progress?.averageRealityScore || 0).toFixed(1)}/10
              </div>
              <div className="text-sm text-gray-600">現実度スコア</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{progress?.streakDays || 0}日</div>
              <div className="text-sm text-gray-600">継続日数</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AIインサイト表示 */}
      {insights.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              AI分析による個人的なインサイト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'warning'
                      ? 'bg-red-50 border-red-200'
                      : insight.type === 'achievement'
                        ? 'bg-green-50 border-green-200'
                        : insight.type === 'suggestion'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        insight.confidence > 0.8
                          ? 'bg-green-100 text-green-800'
                          : insight.confidence > 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                  {insight.actionable && insight.actions && (
                    <div className="flex flex-wrap gap-1">
                      {insight.actions.slice(0, 2).map((action, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* クイックアクション */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Zap className="h-5 w-5" />
            緊急時クイックアクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
              >
                {action.icon}
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* メインコンテンツ */}
      <Tabs defaultValue="focus" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="focus">集中サポート</TabsTrigger>
          <TabsTrigger value="tips">実践的ヒント</TabsTrigger>
          <TabsTrigger value="progress">進捗管理</TabsTrigger>
          <TabsTrigger value="emergency">緊急対応</TabsTrigger>
        </TabsList>

        <TabsContent value="focus">
          <ADHDFocusHelper />
        </TabsContent>

        <TabsContent value="tips">
          <div className="space-y-6">
            {adhdTips.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {section.category}のコツ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="space-y-6">
            {/* 期間選択 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    進捗分析
                  </div>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((timeframe) => (
                      <Button
                        key={timeframe}
                        variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe(timeframe)}
                      >
                        {timeframe === 'daily' ? '日別' : timeframe === 'weekly' ? '週別' : '月別'}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">目標達成率</span>
                          <span className="text-sm font-medium">
                            {progress.totalSessions} / {progress.weeklyGoal} セッション
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((progress.totalSessions / progress.weeklyGoal) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">現実度スコア</span>
                          <span className="text-sm font-medium">
                            {progress.averageRealityScore.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(progress.averageRealityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">継続ストリーク</span>
                          <span className="text-sm font-medium">{progress.streakDays}日</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${Math.min((progress.streakDays / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 月間トレンド */}
            {progress?.monthlyTrends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    月間トレンド
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(progress.monthlyTrends)
                      .slice(0, 3)
                      .map(([month, data]) => (
                        <div
                          key={month}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{month}</div>
                            <div className="text-xs text-gray-600">
                              {data.sessions}セッション • {Math.round(data.totalFocusTime)}分
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              スコア: {data.avgRealityScore.toFixed(1)}
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${(data.avgRealityScore / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>達成バッジ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold">集中マスター</div>
                    <div className="text-xs text-gray-600">5日連続達成</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gray-50">
                    <div className="text-2xl mb-2 opacity-50">🧠</div>
                    <div className="font-semibold text-gray-500">思考分析王</div>
                    <div className="text-xs text-gray-400">100回分析で解放</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold">現実チェッカー</div>
                    <div className="text-xs text-gray-600">妄想阻止10回</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gray-50">
                    <div className="text-2xl mb-2 opacity-50">🏆</div>
                    <div className="font-semibold text-gray-500">ADHD戦士</div>
                    <div className="text-xs text-gray-400">30日継続で解放</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency">
          <div className="space-y-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  妄想スパイラル緊急脱出法
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-red-700">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">🚨 STEP 1: STOP（止める）</h4>
                    <p className="text-sm">
                      「ストップ！」と声に出して言う。手のひらを前に出すジェスチャーをする。
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">👁️ STEP 2: LOOK（見る）</h4>
                    <p className="text-sm">
                      周りを見回す。5つの物を見つけて名前を言う。今いる場所を確認する。
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">👂 STEP 3: LISTEN（聞く）</h4>
                    <p className="text-sm">
                      3つの音を聞き取る。時計の音、外の音、自分の呼吸音など。
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">🫁 STEP 4: BREATHE（呼吸）</h4>
                    <p className="text-sm">4秒吸って、4秒止めて、4秒で吐く。これを3回繰り返す。</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">✅ STEP 5: ACT（行動）</h4>
                    <p className="text-sm">今すぐできる小さな行動を1つ決めて実行する。</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  セルフケア・リマインダー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">身体のケア</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 水を飲む（脱水は集中力を下げる）</li>
                      <li>• 軽いストレッチをする</li>
                      <li>• 深呼吸を5回する</li>
                      <li>• 目を休める（20-20-20ルール）</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">心のケア</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 自分を責めない</li>
                      <li>• 小さな進歩を認める</li>
                      <li>• 完璧でなくても大丈夫</li>
                      <li>• 必要なら休憩を取る</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
