import React from 'react';
import { TodoStats } from '@/types/todo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface StatisticsDetailProps {
  stats: TodoStats;
}

/**
 * タスク統計の詳細表示コンポーネント
 */
export const StatisticsDetail: React.FC<StatisticsDetailProps> = ({ stats }) => {
  // インプット/アウトプットバランスの計算
  const totalTypeCount = stats.inputTasks + stats.outputTasks;
  const inputPercentage =
    totalTypeCount > 0 ? Math.round((stats.inputTasks / totalTypeCount) * 100) : 50;
  const outputPercentage =
    totalTypeCount > 0 ? Math.round((stats.outputTasks / totalTypeCount) * 100) : 50;

  // 期限遵守率の計算
  const totalDeadlineTasks = stats.tasksCompletedBeforeDeadline + stats.tasksCompletedAfterDeadline;
  const beforeDeadlinePercentage =
    totalDeadlineTasks > 0
      ? Math.round((stats.tasksCompletedBeforeDeadline / totalDeadlineTasks) * 100)
      : 0;

  // 完了率インジケーターのスタイル計算
  const getCompletionIndicatorClass = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-gray-600';
  };

  // トレンドインジケーターの計算（実際のAPIではトレンドデータを取得）
  const getTrendIndicator = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    // この例では、ランダムなトレンドを生成（実際のAPIではトレンドデータを取得）
    const isPositive = isHigherBetter ? value >= threshold : value < threshold;

    if (isPositive) {
      return <ArrowUpRight className="h-3 w-3 text-green-500" />;
    } else {
      return <ArrowDownRight className="h-3 w-3 text-red-500" />;
    }
  };

  // AIインサイトの生成
  const getAIInsight = () => {
    if (stats.inputOutputRatio > 1.5) {
      return 'アウトプットタスクをもっと増やすことで知識の定着が進みます。今週はアウトプットタスクを優先的に設定しましょう。';
    }

    if (stats.inputOutputRatio < 0.5) {
      return 'インプットタスクを増やして新しい知識を取り入れましょう。インプットとアウトプットのバランスが重要です。';
    }

    if (stats.deadlineMeetRate < 60) {
      return '期限内に完了できないタスクが多いようです。タスクの粒度を小さくするか、より現実的な期限設定を試みてください。';
    }

    if (stats.completionRate < 50) {
      return 'タスクの完了率が低めです。達成可能な目標設定や、タスクの優先順位付けを見直してみましょう。';
    }

    return 'インプットとアウトプットのバランスが良好です。現在のペースを維持し、継続的な改善を目指しましょう。';
  };

  return (
    <div className="space-y-4">
      {/* タスク概要セクション */}
      <section>
        <h3 className="text-sm font-medium mb-2">タスク概要</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">総タスク数</p>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{stats.totalTasks}</p>
              {getTrendIndicator(stats.totalTasks, 10)}
            </div>
          </div>

          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">完了率</p>
            <div className="flex justify-between items-center">
              <p
                className={`text-sm font-medium ${getCompletionIndicatorClass(stats.completionRate)}`}
              >
                {stats.completionRate}%
              </p>
              {getTrendIndicator(stats.completionRate, 70)}
            </div>
          </div>
        </div>

        {/* 完了率プログレスバー */}
        <div className="mt-2">
          <Progress value={stats.completionRate} className="h-1" />
        </div>
      </section>

      {/* インプット/アウトプットバランス */}
      <section>
        <h3 className="text-sm font-medium mb-2">タスクバランス</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-gray-500">インプットタスク</p>
            <p className="text-sm font-medium text-blue-700">
              {stats.inputTasks} ({inputPercentage}%)
            </p>
          </div>

          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-500">アウトプットタスク</p>
            <p className="text-sm font-medium text-green-700">
              {stats.outputTasks} ({outputPercentage}%)
            </p>
          </div>
        </div>

        {/* バランスプログレスバー */}
        <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="float-left h-full bg-blue-500"
            style={{ width: `${inputPercentage}%` }}
          ></div>
          <div
            className="float-left h-full bg-green-500"
            style={{ width: `${outputPercentage}%` }}
          ></div>
        </div>
      </section>

      {/* 時間効率セクション */}
      <section>
        <h3 className="text-sm font-medium mb-2">時間効率</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">期限内達成</p>
            <p className="text-sm font-medium">{stats.tasksCompletedBeforeDeadline}タスク</p>
          </div>

          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">期限超過</p>
            <p className="text-sm font-medium">{stats.tasksCompletedAfterDeadline}タスク</p>
          </div>
        </div>

        {/* 期限遵守率プログレスバー */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>期限遵守率</span>
            <span>{beforeDeadlinePercentage}%</span>
          </div>
          <Progress value={beforeDeadlinePercentage} className="h-1" />
        </div>
      </section>

      {/* AIインサイト */}
      <section>
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-medium text-blue-700 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              インサイト
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-3">
            <p className="text-xs text-blue-600">{getAIInsight()}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default StatisticsDetail;
