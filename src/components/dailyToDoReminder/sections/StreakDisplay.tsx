import React from 'react';
import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakDisplayProps {
  streakCount: number;
}

export default function StreakDisplay({ streakCount }: StreakDisplayProps) {
  // ストリークに応じたメッセージを取得
  const getStreakMessage = () => {
    if (streakCount === 0) return "まだストリークがありません。タスクを完了して習慣を作りましょう！";
    if (streakCount === 1) return "初日達成！継続は力なり、明日も頑張りましょう！";
    if (streakCount < 3) return `${streakCount}日連続でタスクを完了しています！この調子で続けましょう！`;
    if (streakCount < 7) return `${streakCount}日連続達成！素晴らしい習慣が形成されつつあります！`;
    if (streakCount < 14) return `${streakCount}日連続達成！一週間を超える継続力、素晴らしいです！`;
    if (streakCount < 30) return `${streakCount}日連続達成！二週間を超えると習慣化の成功率が大幅に上がります！`;
    if (streakCount < 60) return `${streakCount}日連続達成！一ヶ月以上の継続は大変な実績です！`;
    if (streakCount < 100) return `${streakCount}日連続達成！二ヶ月以上継続できる人は全体の5%以下です！`;
    return `${streakCount}日連続達成！あなたは習慣化の達人です！`;
  };

  // ストリークに応じたクラス（色）を取得
  const getStreakClass = () => {
    if (streakCount === 0) return "bg-gray-100 text-gray-600";
    if (streakCount < 3) return "bg-blue-100 text-blue-800";
    if (streakCount < 7) return "bg-green-100 text-green-800";
    if (streakCount < 14) return "bg-yellow-100 text-yellow-800";
    if (streakCount < 30) return "bg-orange-100 text-orange-800";
    if (streakCount < 60) return "bg-red-100 text-red-800";
    if (streakCount < 100) return "bg-purple-100 text-purple-800";
    return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${getStreakClass()} px-2 py-1 rounded-full`}>
            <Award className="h-4 w-4" />
            <span>{streakCount}日連続</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStreakMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}