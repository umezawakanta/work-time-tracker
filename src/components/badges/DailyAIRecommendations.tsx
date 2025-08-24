import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Zap,
  Brain,
  Clock,
  Target,
  Coffee,
  Moon,
  Sun,
} from 'lucide-react';

interface DailyTask {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  taskName: string;
  description: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  difficulty: number;
  energyLevel: 'high' | 'medium' | 'low';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

interface AIRecommendation {
  type: 'priority' | 'energy' | 'timing' | 'efficiency' | 'break' | 'focus';
  title: string;
  description: string;
  icon: React.ReactNode;
  urgency: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedTaskId?: string;
}

interface EnergyState {
  currentLevel: number; // 0-100
  optimalLevel: number;
  consumption: number;
  recovery: number;
  timeToRecharge: number; // minutes
  recommendations: string[];
}

interface DailyAIRecommendationsProps {
  tasks: DailyTask[];
  currentTime: Date;
  energyState: EnergyState;
  completedPomodoros: number;
  streakDays: number;
}

export const DailyAIRecommendations: React.FC<DailyAIRecommendationsProps> = ({
  tasks,
  currentTime,
  energyState,
  completedPomodoros,
  streakDays,
}) => {
  // AI推奨事項を生成
  const generateRecommendations = (): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];
    const currentHour = currentTime.getHours();

    const incompleteTasks = tasks.filter((task) => task.status !== 'completed');
    const highPriorityTasks = incompleteTasks.filter((task) => task.priority === 'high');
    const highEnergyTasks = incompleteTasks.filter((task) => task.energyLevel === 'high');

    // 朝の高エネルギータスク推奨
    if (currentHour >= 6 && currentHour <= 10 && highEnergyTasks.length > 0) {
      recommendations.push({
        type: 'energy',
        title: '🌅 朝の集中時間を活用',
        description: `高難易度タスク「${highEnergyTasks[0].taskName}」を今すぐ開始することをお勧めします`,
        icon: <Sun className="w-4 h-4" />,
        urgency: 'high',
        actionable: true,
        relatedTaskId: highEnergyTasks[0].id,
      });
    }

    // 優先度に基づく推奨
    if (highPriorityTasks.length > 0) {
      recommendations.push({
        type: 'priority',
        title: '🔥 高優先度タスクに集中',
        description: `${highPriorityTasks.length}個の高優先度タスクが残っています。順序良く取り組みましょう`,
        icon: <Target className="w-4 h-4" />,
        urgency: 'high',
        actionable: true,
        relatedTaskId: highPriorityTasks[0].id,
      });
    }

    // エネルギーレベルに基づく推奨
    if (energyState.currentLevel < 30) {
      recommendations.push({
        type: 'break',
        title: '😴 休憩が必要です',
        description: `エネルギーレベルが低下しています。${energyState.timeToRecharge}分の休憩をお勧めします`,
        icon: <Coffee className="w-4 h-4" />,
        urgency: 'medium',
        actionable: true,
      });
    } else if (energyState.currentLevel > 80) {
      const difficultTasks = incompleteTasks.filter((task) => task.difficulty >= 4);
      if (difficultTasks.length > 0) {
        recommendations.push({
          type: 'efficiency',
          title: '⚡ 高エネルギー状態を活用',
          description: `現在のエネルギーレベルで難しいタスクに挑戦する絶好のタイミングです`,
          icon: <Zap className="w-4 h-4" />,
          urgency: 'medium',
          actionable: true,
          relatedTaskId: difficultTasks[0].id,
        });
      }
    }

    // 時間効率の推奨
    const overdueTasks = incompleteTasks.filter(
      (task) => task.actualMinutes > task.estimatedMinutes * 1.2
    );
    if (overdueTasks.length > 0) {
      recommendations.push({
        type: 'efficiency',
        title: '⏰ 時間効率を改善',
        description: `いくつかのタスクが予定時間を超過しています。休憩または手法の見直しを検討してください`,
        icon: <Clock className="w-4 h-4" />,
        urgency: 'medium',
        actionable: true,
      });
    }

    // ポモドーロ推奨
    if (completedPomodoros < 4) {
      recommendations.push({
        type: 'focus',
        title: '🍅 ポモドーロテクニック活用',
        description: `今日のポモドーロ: ${completedPomodoros}/8。集中セッションで効率を上げましょう`,
        icon: <Brain className="w-4 h-4" />,
        urgency: 'low',
        actionable: true,
      });
    }

    // 夜間の振り返り推奨
    if (currentHour >= 20) {
      recommendations.push({
        type: 'timing',
        title: '🌙 今日の振り返りをしましょう',
        description: '1日の成果を振り返り、明日の計画を立てる時間です',
        icon: <Moon className="w-4 h-4" />,
        urgency: 'low',
        actionable: true,
      });
    }

    return recommendations.slice(0, 5); // 最大5件
  };

  const recommendations = generateRecommendations();

  // 緊急度別カラー
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // エネルギーレベルカラー
  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* エネルギー状態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            エネルギー状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">現在のエネルギーレベル</span>
                <span className={`text-sm font-bold ${getEnergyColor(energyState.currentLevel)}`}>
                  {energyState.currentLevel}%
                </span>
              </div>
              <Progress value={energyState.currentLevel} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{energyState.consumption}%</div>
                <div className="text-muted-foreground">消費率</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{energyState.recovery}%</div>
                <div className="text-muted-foreground">回復率</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">{energyState.timeToRecharge}m</div>
                <div className="text-muted-foreground">回復時間</div>
              </div>
            </div>

            {/* エネルギー推奨事項 */}
            {energyState.recommendations.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">エネルギー管理のコツ</h4>
                <ul className="text-xs space-y-1">
                  {energyState.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI推奨事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            🤖 AI推奨事項
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                <p>現在、特別な推奨事項はありません。</p>
                <p className="text-sm">予定通り作業を継続してください！</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{rec.title}</span>
                      <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                        {rec.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  {rec.actionable && (
                    <div className="flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 日次統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            今日の統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedPomodoros}</div>
              <div className="text-xs text-muted-foreground">ポモドーロ完了</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streakDays}</div>
              <div className="text-xs text-muted-foreground">連続実行日数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tasks.filter((t) => t.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">完了タスク</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((tasks.reduce((sum, t) => sum + t.actualMinutes, 0) / 60) * 10) / 10}h
              </div>
              <div className="text-xs text-muted-foreground">実働時間</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyAIRecommendations;
