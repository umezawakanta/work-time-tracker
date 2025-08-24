import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface TimeSeriesComparison {
  date: string;
  plannedCumulative: number;
  actualCumulative: number;
  plannedDaily: number;
  actualDaily: number;
  gap: number;
}

// 時系列比較チャート表示コンポーネント
export const renderTimeSeriesComparison = (timeSeriesData: TimeSeriesComparison[]) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        📊 時系列推移 - 予定vs実績
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* チャート代替表示（簡易版） */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>予定（累積）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>実績（累積）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>ギャップ</span>
            </div>
          </div>

          {/* 時系列データポイント */}
          <div className="space-y-2">
            {timeSeriesData.map((point, index) => (
              <div key={point.date} className="grid grid-cols-6 gap-2 text-sm">
                <div className="text-muted-foreground">
                  {new Date(point.date).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-center">
                  <div className="text-gray-600 font-medium">{point.plannedCumulative}</div>
                  <div className="text-xs text-muted-foreground">予定</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-medium">{point.actualCumulative}</div>
                  <div className="text-xs text-muted-foreground">実績</div>
                </div>
                <div className="text-center">
                  <div
                    className={`font-medium ${point.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {point.gap >= 0 ? '+' : ''}
                    {point.gap}
                  </div>
                  <div className="text-xs text-muted-foreground">差異</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">{point.plannedDaily}</div>
                  <div className="text-xs text-muted-foreground">日次予定</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600">{point.actualDaily}</div>
                  <div className="text-xs text-muted-foreground">日次実績</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 傾向分析 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold mb-3">📈 傾向分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-blue-600">初期段階</div>
              <div className="text-sm text-muted-foreground">
                7月1-10日: 予定通りのスタート、軽微な遅れ
              </div>
            </div>
            <div>
              <div className="font-medium text-yellow-600">中期段階</div>
              <div className="text-sm text-muted-foreground">
                7月11-20日: 遅れが拡大傾向、要注意フェーズ
              </div>
            </div>
            <div>
              <div className="font-medium text-red-600">後期段階</div>
              <div className="text-sm text-muted-foreground">
                7月21-31日: 大幅な遅れ、緊急対応が必要
              </div>
            </div>
          </div>
        </div>

        {/* ギャップ分析 */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">🔍 ギャップ分析</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-red-700">最大ギャップ</div>
                <div className="text-sm text-red-600">7月31日時点で-11バッジの遅れ</div>
              </div>
              <div className="text-2xl font-bold text-red-600">-11</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-yellow-700">平均遅延</div>
                <div className="text-sm text-yellow-600">月を通して平均-4.2バッジの遅れ</div>
              </div>
              <div className="text-2xl font-bold text-yellow-600">-4.2</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-700">回復可能性</div>
                <div className="text-sm text-blue-600">現在のペースでは回復困難</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">25%</div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
