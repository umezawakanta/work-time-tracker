import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Download, Upload } from "lucide-react";

interface ProgressSectionProps {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  inputCount: number;
  outputCount: number;
}

export default function ProgressSection({
  completedCount,
  totalCount,
  progressPercentage,
  inputCount,
  outputCount
}: ProgressSectionProps) {
  // インプット/アウトプットのバランス計算
  const totalTypeCount = inputCount + outputCount;
  const inputPercentage =
    totalTypeCount > 0 ? Math.round((inputCount / totalTypeCount) * 100) : 50;
  const outputPercentage =
    totalTypeCount > 0 ? Math.round((outputCount / totalTypeCount) * 100) : 50;

  return (
    <>
      {/* 進捗バー */}
      <div className="px-4 pb-2">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>
            進捗状況: {completedCount}/{totalCount} タスク
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* インプット/アウトプットバランス */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>インプット/アウトプット:</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 text-xs">{inputPercentage}%</span>
            </div>
            <span>:</span>
            <div className="flex items-center gap-1">
              <Upload className="h-3 w-3 text-green-500" />
              <span className="text-green-600 text-xs">{outputPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="float-left h-full bg-blue-500"
            style={{ width: `${inputPercentage}%` }}
          ></div>
          <div
            className="float-left h-full bg-green-500"
            style={{ width: `${outputPercentage}%` }}
          ></div>
        </div>
      </div>
    </>
  );
}