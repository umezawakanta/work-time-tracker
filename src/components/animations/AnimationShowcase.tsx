import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 🎬 アニメーションアーティスト: アニメーションショーケース
 * 基本的なアニメーション効果とマイクロインタラクションの展示
 */
export const AnimationShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(3);

  const handleLoadingDemo = () => {
    setLoading((v) => !v);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4 animate-fade-in">
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

      {/* 🎬 アニメーションアーティストバッジ進捗 */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                  <Badge variant="default">サンプル</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">アニメーションライブラリ統合</span>
                  <Badge variant="default">サンプル</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">パフォーマンス最適化</span>
                  <Badge variant="default">サンプル</Badge>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-purple-700 mb-1">進捗サンプル</div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full animate-pulse"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アニメーションデモ */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Tabs defaultValue="interactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interactions">インタラクション</TabsTrigger>
            <TabsTrigger value="feedback">フィードバック</TabsTrigger>
            <TabsTrigger value="loaders">ローダー</TabsTrigger>
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
                    <Button
                      variant="outline"
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      スケール変換
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:rotate-2 transition-transform duration-200"
                    >
                      回転効果
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:shadow-lg transition-shadow duration-200"
                    >
                      シャドウ効果
                    </Button>
                  </div>
                </div>

                {/* いいねボタン */}
                <div>
                  <h4 className="font-semibold mb-3">いいねボタン</h4>
                  <Button
                    variant={liked ? 'default' : 'outline'}
                    onClick={() => setLiked(!liked)}
                    className={cn(
                      'transition-all duration-300',
                      liked ? 'scale-110 text-red-500' : 'hover:scale-105'
                    )}
                  >
                    <Heart className={cn('h-4 w-4 mr-2', liked && 'fill-current')} />
                    {liked ? 'いいね済み' : 'いいね'}
                  </Button>
                </div>

                {/* 星評価 */}
                <div>
                  <h4 className="font-semibold mb-3">星評価</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            'h-6 w-6 transition-all duration-200',
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
                            'hover:scale-110'
                          )}
                        />
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">評価: {rating}/5</p>
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
                  <h4 className="font-semibold mb-3">ボタンフィードバック</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50 active:scale-95 transition-all duration-150"
                    >
                      成功
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 active:animate-pulse"
                    >
                      エラー
                    </Button>
                    <Button
                      variant="outline"
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 active:animate-bounce"
                    >
                      警告
                    </Button>
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 active:animate-spin"
                    >
                      情報
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">アニメーション効果</h4>
                  <div className="flex gap-4">
                    <div className="animate-bounce bg-blue-500 text-white p-3 rounded-lg">
                      Bounce
                    </div>
                    <div className="animate-pulse bg-green-500 text-white p-3 rounded-lg">
                      Pulse
                    </div>
                    <div className="animate-ping bg-red-500 text-white p-3 rounded-lg">Ping</div>
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
                  <h4 className="font-semibold mb-3">ローディングスピナー</h4>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-xs mt-2">Small</p>
                    </div>
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-xs mt-2">Medium</p>
                    </div>
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-xs mt-2">Large</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">ローディングボタン</h4>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleLoadingDemo}
                      disabled={loading}
                      className="transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          読み込み中...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          ローディング開始
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">プログレスアニメーション</h4>
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full animate-pulse"
                        style={{ width: '45%' }}
                      />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: '75%' }}
                      />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full animate-bounce"
                        style={{ width: '90%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* フローティングアクションボタン風デモ */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button
          size="icon"
          className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
          title="共有"
        >
          <Share className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
          title="ダウンロード"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
          title="設定"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AnimationShowcase;
