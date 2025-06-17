import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, TrendingUp, Clock, Target } from 'lucide-react';
import { pomodoroWorkTimeIntegration } from '@/services/PomodoroWorkTimeIntegrationService';

interface PomodoroStats {
  totalSessions: number;
  totalWorkTime: number;
  averageSessionLength: number;
  mostProductiveHour: number;
}

export const PomodoroStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    totalWorkTime: 0,
    averageSessionLength: 0,
    mostProductiveHour: 9,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const pomodoroStats = await pomodoroWorkTimeIntegration.getTodayPomodoroStats();
        setStats(pomodoroStats);
      } catch (error) {
        console.error('ポモドーロ統計の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getProductivityLevel = (sessions: number): { level: string; color: string } => {
    if (sessions >= 8) return { level: '非常に高い', color: 'bg-green-100 text-green-800' };
    if (sessions >= 6) return { level: '高い', color: 'bg-blue-100 text-blue-800' };
    if (sessions >= 4) return { level: '普通', color: 'bg-yellow-100 text-yellow-800' };
    if (sessions >= 1) return { level: '低い', color: 'bg-orange-100 text-orange-800' };
    return { level: 'なし', color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            今日のポモドーロ統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">読み込み中...</div>
        </CardContent>
      </Card>
    );
  }

  const productivity = getProductivityLevel(stats.totalSessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-red-500" />
          今日のポモドーロ統計
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* メイン統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">完了セッション</div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalWorkTime}</div>
            <div className="text-sm text-muted-foreground">総作業時間（分）</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.averageSessionLength}</div>
            <div className="text-sm text-muted-foreground">平均時間（分）</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatHour(stats.mostProductiveHour)}
            </div>
            <div className="text-sm text-muted-foreground">最生産的時間帯</div>
          </div>
        </div>

        {/* 生産性レベル */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">今日の生産性:</span>
          </div>
          <Badge className={productivity.color}>{productivity.level}</Badge>
        </div>

        {/* 詳細情報 */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {stats.totalSessions > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>1日あたりの推奨セッション数: 6-8回</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>
                  {stats.totalSessions < 6
                    ? `あと${6 - stats.totalSessions}セッションで推奨レベルに到達`
                    : '推奨レベルを達成しています！'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Timer className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p>今日はまだポモドーロセッションがありません</p>
              <p className="text-xs">ポモドーロタイマーを使って集中作業を始めましょう！</p>
            </div>
          )}
        </div>

        {/* 時間効率性のヒント */}
        {stats.totalSessions > 0 && stats.averageSessionLength > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-1">💡 効率性のヒント</h4>
            <p className="text-xs text-muted-foreground">
              {stats.averageSessionLength < 20
                ? '短めのセッションが多いようです。集中が途切れやすい環境かもしれません。'
                : stats.averageSessionLength > 30
                  ? '長めのセッションが多いようです。適度な休憩を取ることをお勧めします。'
                  : '理想的なセッション長を保っています！この調子で続けましょう。'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
