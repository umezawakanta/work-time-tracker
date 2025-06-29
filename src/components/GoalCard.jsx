// GoalCard.jsx
// 個々の目標を表示するためのカードコンポーネント

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart as ChartIcon,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// 日本語ロケールの追加が必要な場合は別途対応

export function GoalCard({ goal, onEdit, onDelete, onViewDetails }) {
  const [showTrend, setShowTrend] = useState(false);

  // 開始値と目標値の差分に対する現在値の進捗を計算
  const calculateProgress = () => {
    if (goal.type === 'debt') {
      // 負債の場合は逆（減らすのが目標）
      if (goal.startValue === 0) return 0;
      const reduction = goal.startValue - goal.currentValue;
      const target = goal.startValue - goal.targetValue;
      return target > 0 ? Math.min(100, (reduction / target) * 100) : 0;
    } else {
      // 資産・純資産などの場合
      const range = goal.targetValue - goal.startValue;
      if (range === 0) return 0;
      const achieved = goal.currentValue - goal.startValue;
      return Math.min(100, (achieved / range) * 100);
    }
  };

  // 残り日数の計算
  const calculateRemainingDays = () => {
    const targetDate = parseISO(goal.targetDate);
    const today = new Date();
    return Math.max(0, differenceInDays(targetDate, today));
  };

  // 1日あたりに必要な金額を計算
  const calculateDailyAmount = () => {
    const remainingDays = calculateRemainingDays();
    if (remainingDays === 0) return 0;

    if (goal.type === 'debt') {
      // 残りの返済金額 ÷ 残り日数
      const remainingAmount = goal.currentValue - goal.targetValue;
      return remainingAmount / remainingDays;
    } else {
      // 残りの目標金額 ÷ 残り日数
      const remainingAmount = goal.targetValue - goal.currentValue;
      return remainingAmount / remainingDays;
    }
  };

  // 目標タイプに応じたアイコンとカラーを取得
  const getTypeConfig = () => {
    switch (goal.type) {
      case 'asset':
        return {
          icon: <ArrowUp className="h-4 w-4" />,
          color: 'bg-blue-500',
          label: '資産構築',
        };
      case 'debt':
        return {
          icon: <ArrowDown className="h-4 w-4" />,
          color: 'bg-red-500',
          label: '負債削減',
        };
      case 'networth':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'bg-green-500',
          label: '純資産目標',
        };
      case 'savings':
        return {
          icon: <ChartIcon className="h-4 w-4" />,
          color: 'bg-purple-500',
          label: '貯蓄目標',
        };
      case 'investment':
        return {
          icon: <Target className="h-4 w-4" />,
          color: 'bg-amber-500',
          label: '投資目標',
        };
      default:
        return {
          icon: <Target className="h-4 w-4" />,
          color: 'bg-gray-500',
          label: 'その他',
        };
    }
  };

  const progress = calculateProgress();
  const remainingDays = calculateRemainingDays();
  const dailyAmount = calculateDailyAmount();
  const typeConfig = getTypeConfig();

  // 進捗状況に応じたラベルとカラーを取得
  const getProgressStatus = () => {
    if (progress >= 100) {
      return { label: '達成済み', color: 'bg-green-500' };
    } else if (progress >= 75) {
      return { label: '順調', color: 'bg-blue-500' };
    } else if (progress >= 50) {
      return { label: '進行中', color: 'bg-blue-400' };
    } else if (progress >= 25) {
      return { label: '初期段階', color: 'bg-yellow-500' };
    } else {
      return { label: '開始', color: 'bg-orange-500' };
    }
  };

  const progressStatus = getProgressStatus();

  // 履歴の最新2件を取得
  const recentHistory = goal.history ? [...goal.history].reverse().slice(0, 2) : [];

  // 目標の進行度合いを文字で表現
  const getProgressText = () => {
    const progressPercent = Math.round(progress);

    if (goal.type === 'debt') {
      return `${goal.currentValue.toLocaleString()}円 / ${goal.targetValue.toLocaleString()}円まで削減`;
    } else {
      return `${goal.currentValue.toLocaleString()}円 / ${goal.targetValue.toLocaleString()}円`;
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={`${typeConfig.color} text-white`}>
                {typeConfig.icon}
                <span className="ml-1">{typeConfig.label}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                残り{remainingDays}日
              </Badge>
            </div>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <CardDescription>
              {format(parseISO(goal.startDate), 'yyyy/MM/dd')} 〜{' '}
              {format(parseISO(goal.targetDate), 'yyyy/MM/dd')}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal.id)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>編集</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDetails(goal.id)}>
                <ChartIcon className="mr-2 h-4 w-4" />
                <span>詳細を見る</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>削除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          {/* 進捗バー */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{getProgressText()}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {showTrend && goal.history && goal.history.length > 1 && (
            <div className="pt-2">
              {/* ここに簡易的なトレンドグラフを表示 */}
              <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center">
                <span className="text-xs text-muted-foreground">グラフ表示（未実装）</span>
              </div>
            </div>
          )}

          {/* 最近の履歴 */}
          {recentHistory.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-1">最近の履歴:</p>
              <div className="space-y-1">
                {recentHistory.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{format(parseISO(item.date), 'yyyy/MM/dd')}</span>
                    <span className="font-medium">{item.value.toLocaleString()}円</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 pt-3 pb-3 flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setShowTrend(!showTrend)}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {showTrend ? 'グラフを隠す' : 'グラフを表示'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>進捗グラフを表示/非表示</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Badge
          variant="outline"
          className={`text-${dailyAmount > 0 ? 'blue' : 'green'}-600 text-xs`}
        >
          {dailyAmount > 0 ? (
            <>
              目標達成まで
              <span className="font-bold ml-1">
                {Math.round(dailyAmount).toLocaleString()}円/日
              </span>
            </>
          ) : (
            '目標達成済み！'
          )}
        </Badge>
      </CardFooter>
    </Card>
  );
}
