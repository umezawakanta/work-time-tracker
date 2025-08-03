import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SNSShareComponent from '@/components/social/SNSShareComponent';
import {
  Share2,
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  Target,
  Heart,
  MessageSquare,
  Award,
  Zap,
} from 'lucide-react';

/**
 * SNSシェアページ - ソーシャルメディア拡散センター
 */
const SNSSharePage: React.FC = () => {
  const shareTemplates = [
    {
      title: '生産性革命！Work Time Tracker',
      description:
        '🎯 4象限タスク分類 + 🧠 AI統合で、仕事の効率が劇的アップ！ADHD特化機能も搭載で、誰でも使いやすい究極の生産性ツール ✨',
      hashtags: ['WorkTimeTracker', '生産性', 'AI', 'ADHD支援', 'タスク管理'],
      category: '一般向け',
      engagement: '高',
    },
    {
      title: 'ADHD当事者必見の神アプリ',
      description:
        '🧠 認知特性に最適化されたタスク管理で、集中力の課題を解決！4象限分類とゲーミフィケーションで、継続が苦手でも楽しく続けられる 🎮',
      hashtags: ['ADHD', '発達障害', '認知特性', 'ライフハック', '集中力'],
      category: 'ADHD特化',
      engagement: '非常に高',
    },
    {
      title: 'チーム生産性を最大化するツール',
      description:
        '📊 包括的分析ダッシュボード + 役割別ダッシュボードで、チーム全体の生産性を見える化！リモートワークにも最適 💼',
      hashtags: ['チーム管理', 'リモートワーク', '生産性', 'マネジメント', 'DX'],
      category: 'ビジネス向け',
      engagement: '高',
    },
    {
      title: 'フリーランス・個人事業主の強い味方',
      description:
        '💪 時間管理 + 収益分析 + 目標設定が一つに！自分のペースで働きながらも、確実に成果を上げられるパーソナルアシスタント 🚀',
      hashtags: ['フリーランス', '個人事業主', '時間管理', '収益向上', '自己管理'],
      category: '個人事業主向け',
      engagement: '高',
    },
  ];

  const growthMetrics = [
    { label: 'SNSシェア数', value: '2,847', trend: '+23%', icon: <Share2 className="h-5 w-5" /> },
    {
      label: '新規ユーザー獲得',
      value: '1,234',
      trend: '+34%',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'バイラル係数',
      value: '1.67',
      trend: '+12%',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: 'エンゲージメント率',
      value: '8.9%',
      trend: '+5%',
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">SNS拡散センター</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Work Time Trackerをソーシャルメディアで拡散して、
              <span className="font-semibold text-purple-600">より多くの人の生産性向上を支援</span>
              しましょう
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>グローバル展開対応</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>ターゲット最適化</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>AI分析サポート</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 成長指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {growthMetrics.map((metric, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">{metric.icon}</div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">{metric.trend}</span>
                  <span className="text-sm text-gray-500 ml-1">前月比</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* メインシェアコンポーネント */}
        <div className="mb-8">
          <SNSShareComponent showStats={true} customizable={true} />
        </div>

        {/* テンプレート集 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              シェアテンプレート集
            </CardTitle>
            <CardDescription>
              ターゲット別に最適化されたシェアメッセージテンプレート
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shareTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge
                          className={
                            template.engagement === '非常に高'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {template.engagement}エンゲージメント
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.hashtags.map((hashtag) => (
                        <Badge key={hashtag} variant="secondary" className="text-xs">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4">
                      <SNSShareComponent
                        content={{
                          title: template.title,
                          description: template.description,
                          url: window.location.origin,
                          hashtags: template.hashtags,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 拡散戦略とガイド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                効果的な拡散戦略
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium">タイミング最適化</h4>
                  <p className="text-sm text-gray-600">
                    平日9-11時、15-17時、日曜20-22時が最もエンゲージメントが高い
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">コミュニティ参加</h4>
                  <p className="text-sm text-gray-600">
                    生産性向上、ADHD支援、リモートワーク関連グループでのシェア
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-medium">体験談の追加</h4>
                  <p className="text-sm text-gray-600">
                    具体的な改善例や数値的な成果を含めると拡散力がアップ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                ターゲット別アプローチ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-purple-900">🧠 ADHD当事者</h4>
                <p className="text-sm text-purple-700">
                  認知特性、集中力、継続性の課題解決にフォーカス
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">💼 ビジネスユーザー</h4>
                <p className="text-sm text-blue-700">ROI、チーム効率、データ分析機能を強調</p>
              </div>
              <div>
                <h4 className="font-medium text-green-900">🏠 リモートワーカー</h4>
                <p className="text-sm text-green-700">自己管理、時間管理、集中環境作りを重点的に</p>
              </div>
              <div>
                <h4 className="font-medium text-orange-900">🚀 フリーランス</h4>
                <p className="text-sm text-orange-700">
                  収益性、クライアント管理、スケール性を訴求
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SNSSharePage;
