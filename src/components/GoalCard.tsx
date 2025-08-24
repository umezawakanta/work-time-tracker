// GoalCard.tsx
// 個々の目標を表示するためのカードコンポーネント

import React, { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Pause,
} from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';

// 目標の型定義
interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  targetDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onClick }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // 優先度に応じた色を返す
  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ステータスに応じた色を返す
  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ステータスアイコンを返す
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // 進捗に応じたプログレスバーの色を返す
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 目標日までの残り日数を計算
  const getDaysRemaining = () => {
    try {
      const targetDate = parseISO(goal.targetDate);
      const today = new Date();
      return differenceInDays(targetDate, today);
    } catch {
      return 0;
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy/MM/dd');
    } catch {
      return dateString;
    }
  };

  const daysRemaining = getDaysRemaining();

  const handleCardClick = (e: React.MouseEvent) => {
    // ドロップダウンメニューやボタンクリック時は親要素のクリックイベントを実行しない
    const target = e.target as HTMLElement;
    if (target.closest('[data-prevent-click]')) {
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        goal.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(goal.status)}
            <Target className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-center gap-1" data-prevent-click>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  詳細表示
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>

        {goal.description && (
          <CardDescription className="text-sm">
            {goal.description.length > 100
              ? `${goal.description.substring(0, 100)}...`
              : goal.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ステータスと優先度のバッジ */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(goal.status)}>
            {goal.status === 'active'
              ? '進行中'
              : goal.status === 'completed'
                ? '完了'
                : '一時停止'}
          </Badge>
          <Badge className={getPriorityColor(goal.priority)}>
            {goal.priority === 'high'
              ? '高優先度'
              : goal.priority === 'medium'
                ? '中優先度'
                : '低優先度'}
          </Badge>
          <Badge variant="outline">{goal.category}</Badge>
        </div>

        {/* 進捗バー */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">進捗</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        {/* 目標日と残り日数 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>目標日</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatDate(goal.targetDate)}</div>
            <div
              className={`text-xs ${
                daysRemaining < 0
                  ? 'text-red-600'
                  : daysRemaining <= 7
                    ? 'text-yellow-600'
                    : 'text-gray-500'
              }`}
            >
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)}日経過`
                : daysRemaining === 0
                  ? '今日が期限'
                  : `残り${daysRemaining}日`}
            </div>
          </div>
        </div>

        {/* 詳細情報（展開時） */}
        {showDetails && (
          <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">作成日:</span>
                <div>{formatDate(goal.createdAt)}</div>
              </div>
              <div>
                <span className="text-gray-600">更新日:</span>
                <div>{formatDate(goal.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* アクションボタン（完了していない場合のみ表示） */}
      {goal.status !== 'completed' && (
        <CardFooter className="pt-0" data-prevent-click>
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                編集
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {showDetails ? '閉じる' : '詳細'}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
