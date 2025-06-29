import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

// 来月予測表示コンポーネント
export const renderNextMonthPredictions = (predictions: {
  nextMonthBadges: number;
  nextMonthHours: number;
  recommendedFocus: string[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="w-5 h-5" />
        🔮 来月予測・推奨事項
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* 予測メトリクス */}
        <div>
          <h4 className="font-semibold mb-3">📈 来月予測</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {predictions.nextMonthBadges}
              </div>
              <div className="text-sm text-muted-foreground">予測バッジ獲得数</div>
              <div className="text-xs text-green-600 mt-1">
                +{Math.round((predictions.nextMonthBadges / 4 - 1) * 100)}% 向上予測
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {predictions.nextMonthHours}h
              </div>
              <div className="text-sm text-muted-foreground">予測学習時間</div>
              <div className="text-xs text-purple-600 mt-1">
                +{Math.round((predictions.nextMonthHours / 142 - 1) * 100)}% 時間増加予測
              </div>
            </div>
          </div>
        </div>

        {/* 推奨フォーカス */}
        <div>
          <h4 className="font-semibold mb-3">🎯 推奨フォーカス領域</h4>
          <div className="space-y-3">
            {predictions.recommendedFocus.map((focus, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{focus}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* AI推奨アクション */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            🤖 AI推奨アクション
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>現在のペースを維持しつつ、AI・機械学習分野の学習時間を週5時間増加</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>セキュリティ分野の高い効率を他分野にも応用するため、学習方法を標準化</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>週次効率の変動を抑えるため、一定の学習リズムの確立を推奨</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
