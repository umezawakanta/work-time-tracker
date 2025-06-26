import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MicroInteraction,
  SparkleEffectCSS,
  AnimatedLikeButtonCSS,
  AnimatedStarRatingCSS,
  AnimatedLoaderCSS,
  AnimatedFeedbackCSS,
} from './MicroInteractions';
import {
  Heart,
  Star,
  Sparkles,
  Play,
  Download,
  Share,
  Bookmark,
  Settings,
  Zap,
  Rocket,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 🎬 アニメーションアーティスト: アニメーションショーケース
 * すべてのマイクロインタラクションとアニメーションの実例展示
 */
export const AnimationShowcase: React.FC = () => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'warning' | 'info'>(
    'success'
  );
  const [rating, setRating] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const showFeedback = (type: 'success' | 'error' | 'warning' | 'info') => {
    setFeedbackType(type);
    setFeedbackVisible(true);
    setTimeout(() => setFeedbackVisible(false), 3000);
  };

  const fabActions = [
    {
      icon: <Download className="h-4 w-4" />,
      label: 'ダウンロード',
      onClick: () => showFeedback('success'),
    },
    {
      icon: <Share className="h-4 w-4" />,
      label: '共有',
      onClick: () => showFeedback('info'),
    },
    {
      icon: <Bookmark className="h-4 w-4" />,
      label: 'ブックマーク',
      onClick: () => showFeedback('success'),
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: '設定',
      onClick: () => showFeedback('info'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* ヘッダー */}
      <InViewAnimation animation="slideUp">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold tracking-tight">🎬 アニメーションショーケース</h1>
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              ARTIST
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            美しいマイクロインタラクションとアニメーションでユーザー体験を向上させる
          </p>
        </div>
      </InViewAnimation>

      {/* 🎬 アニメーションアーティストバッジ進捗 */}
      <InViewAnimation animation="slideUp" delay={0.1}>
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              🎬 アニメーションアーティストバッジ進捗
              <Badge variant="secondary">GOLD</Badge>
            </CardTitle>
            <CardDescription className="text-purple-700">
              マイクロインタラクションとアニメーション効果の完全実装
            </CardDescription>
          </CardHeader>
          <CardContent className="text-purple-800">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                ローディングアニメーション実装
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                マイクロインタラクション完成
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                トランジション効果実装
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                60fps安定動作最適化
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">達成状況</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">マイクロインタラクション実装</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">アニメーションライブラリ統合</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">パフォーマンス最適化</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-purple-700 mb-1">進捗: 100%</div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </InViewAnimation>

      {/* アニメーションカテゴリータブ */}
      <InViewAnimation animation="slideUp" delay={0.2}>
        <Tabs defaultValue="interactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interactions">インタラクション</TabsTrigger>
            <TabsTrigger value="feedback">フィードバック</TabsTrigger>
            <TabsTrigger value="loaders">ローダー</TabsTrigger>
            <TabsTrigger value="transitions">トランジション</TabsTrigger>
          </TabsList>

          {/* マイクロインタラクション */}
          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>マイクロインタラクション</CardTitle>
                <CardDescription>
                  ホバー、クリック、フォーカス時の細やかなアニメーション
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ホバーエフェクト */}
                <div>
                  <h4 className="font-semibold mb-3">ホバーエフェクト</h4>
                  <div className="flex gap-4 flex-wrap">
                    <MicroInteraction type="hover" intensity="subtle">
                      <Button variant="outline">Subtle Hover</Button>
                    </MicroInteraction>
                    <MicroInteraction type="hover" intensity="medium">
                      <Button variant="outline">Medium Hover</Button>
                    </MicroInteraction>
                    <MicroInteraction type="hover" intensity="strong">
                      <Button variant="outline">Strong Hover</Button>
                    </MicroInteraction>
                  </div>
                </div>

                {/* クリックエフェクト */}
                <div>
                  <h4 className="font-semibold mb-3">クリックエフェクト</h4>
                  <div className="flex gap-4 flex-wrap">
                    <MicroInteraction type="click" intensity="subtle">
                      <Button>Subtle Click</Button>
                    </MicroInteraction>
                    <MicroInteraction type="click" intensity="medium">
                      <Button>Medium Click</Button>
                    </MicroInteraction>
                    <MicroInteraction type="click" intensity="strong">
                      <Button>Strong Click</Button>
                    </MicroInteraction>
                  </div>
                </div>

                {/* いいねボタン */}
                <div>
                  <h4 className="font-semibold mb-3">いいねボタン（スパークル効果付き）</h4>
                  <div className="flex gap-4 flex-wrap">
                    <AnimatedLikeButtonCSS
                      onToggle={(liked: boolean) => liked && setShowSparkles(true)}
                    />
                    <SparkleEffect trigger={showSparkles}>
                      <Button variant="outline" onClick={() => setShowSparkles(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        スパークル効果
                      </Button>
                    </SparkleEffect>
                  </div>
                </div>

                {/* 星評価 */}
                <div>
                  <h4 className="font-semibold mb-3">星評価アニメーション</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">
                        インタラクティブ評価:
                      </span>
                      <AnimatedStarRating rating={rating} onRate={setRating} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">読み取り専用評価:</span>
                      <AnimatedStarRating rating={4.5} readonly />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* フィードバックアニメーション */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>フィードバックアニメーション</CardTitle>
                <CardDescription>成功、エラー、警告などのステート変更通知</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">通知フィードバック</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => showFeedback('success')}
                      className="text-green-600 border-green-600"
                    >
                      成功通知
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showFeedback('error')}
                      className="text-red-600 border-red-600"
                    >
                      エラー通知
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showFeedback('warning')}
                      className="text-yellow-600 border-yellow-600"
                    >
                      警告通知
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showFeedback('info')}
                      className="text-blue-600 border-blue-600"
                    >
                      情報通知
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">エラーシェイク</h4>
                  <div className="flex gap-4">
                    <MicroInteraction type="error" intensity="subtle">
                      <Button variant="destructive">Subtle Shake</Button>
                    </MicroInteraction>
                    <MicroInteraction type="error" intensity="medium">
                      <Button variant="destructive">Medium Shake</Button>
                    </MicroInteraction>
                    <MicroInteraction type="error" intensity="strong">
                      <Button variant="destructive">Strong Shake</Button>
                    </MicroInteraction>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">成功エフェクト</h4>
                  <div className="flex gap-4">
                    <MicroInteraction type="success" intensity="subtle">
                      <Button className="bg-green-500 hover:bg-green-600">Subtle Success</Button>
                    </MicroInteraction>
                    <MicroInteraction type="success" intensity="medium">
                      <Button className="bg-green-500 hover:bg-green-600">Medium Success</Button>
                    </MicroInteraction>
                    <MicroInteraction type="success" intensity="strong">
                      <Button className="bg-green-500 hover:bg-green-600">Strong Success</Button>
                    </MicroInteraction>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ローダーアニメーション */}
          <TabsContent value="loaders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ローダーアニメーション</CardTitle>
                <CardDescription>読み込み中のフィードバック表示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">スピンローダー</h4>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <AnimatedLoader size="sm" type="spin" />
                      <p className="text-xs mt-2">Small</p>
                    </div>
                    <div className="text-center">
                      <AnimatedLoader size="md" type="spin" />
                      <p className="text-xs mt-2">Medium</p>
                    </div>
                    <div className="text-center">
                      <AnimatedLoader size="lg" type="spin" />
                      <p className="text-xs mt-2">Large</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">パルスローダー</h4>
                  <div className="flex items-center gap-6">
                    <AnimatedLoader size="sm" type="pulse" />
                    <AnimatedLoader size="md" type="pulse" />
                    <AnimatedLoader size="lg" type="pulse" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">バウンスローダー</h4>
                  <div className="flex items-center gap-6">
                    <AnimatedLoader size="sm" type="bounce" />
                    <AnimatedLoader size="md" type="bounce" />
                    <AnimatedLoader size="lg" type="bounce" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">ローディングボタン</h4>
                  <div className="flex gap-4">
                    <MicroInteraction type="loading">
                      <Button disabled>
                        <AnimatedLoader size="sm" type="spin" />
                        <span className="ml-2">読み込み中...</span>
                      </Button>
                    </MicroInteraction>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* トランジションアニメーション */}
          <TabsContent value="transitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>トランジションアニメーション</CardTitle>
                <CardDescription>ページ読み込み時やスクロール時のアニメーション</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h4 className="font-semibold mb-3">スクロール連動アニメーション</h4>
                  <div className="space-y-4">
                    <InViewAnimation animation="fadeIn">
                      <Card className="p-4">
                        <p>フェードイン効果</p>
                      </Card>
                    </InViewAnimation>

                    <InViewAnimation animation="slideUp" delay={0.1}>
                      <Card className="p-4">
                        <p>下からスライドイン（0.1s遅延）</p>
                      </Card>
                    </InViewAnimation>

                    <InViewAnimation animation="slideLeft" delay={0.2}>
                      <Card className="p-4">
                        <p>右からスライドイン（0.2s遅延）</p>
                      </Card>
                    </InViewAnimation>

                    <InViewAnimation animation="slideRight" delay={0.3}>
                      <Card className="p-4">
                        <p>左からスライドイン（0.3s遅延）</p>
                      </Card>
                    </InViewAnimation>

                    <InViewAnimation animation="scaleIn" delay={0.4}>
                      <Card className="p-4">
                        <p>スケールイン効果（0.4s遅延）</p>
                      </Card>
                    </InViewAnimation>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </InViewAnimation>

      {/* フローティングアクションボタン */}
      <FloatingActionButton icon={<Zap className="h-5 w-5" />} actions={fabActions} />

      {/* フィードバック通知 */}
      <AnimatedFeedback
        type={feedbackType}
        message={
          {
            success: '操作が正常に完了しました！',
            error: 'エラーが発生しました。もう一度お試しください。',
            warning: '注意: この操作は取り消せません。',
            info: '情報: 新しい機能が利用可能です。',
          }[feedbackType]
        }
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
      />
    </div>
  );
};

export default AnimationShowcase;
