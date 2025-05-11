// src/components/dailyToDoReminder/analysis/TodoAnalysis.tsx
import React from "react";
import { useSelector } from "react-redux";
import { selectAnalysisSummary } from "@/store/todoSlice";

/**
 * タスク分析コンポーネント
 * タスクの傾向や統計情報を表示します
 */
const TodoAnalysis: React.FC = () => {
  const analysisSummary = useSelector(selectAnalysisSummary);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">タスク分析</h2>

      {!analysisSummary ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 mb-2">分析データを読み込み中...</p>
          <p className="text-sm text-gray-400">
            初回の分析には時間がかかることがあります
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 分析データのサマリーセクション */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">サマリー</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">完了率</p>
                <p className="text-xl font-bold">
                  {analysisSummary.completionRate || 0}%
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">平均タスク数/日</p>
                <p className="text-xl font-bold">
                  {analysisSummary.averageTasksPerDay || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">最も生産的な曜日</p>
                <p className="text-xl font-bold">
                  {analysisSummary.mostProductiveDay || "未確定"}
                </p>
              </div>
            </div>
          </section>

          {/* カテゴリ分析 */}
          <section>
            <h3 className="text-lg font-medium mb-2">カテゴリ分析</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span>インプット</span>
                <span>{analysisSummary.categoryStats?.input || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      analysisSummary.categoryDistribution?.input
                        ? analysisSummary.categoryDistribution.input * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between mb-2 mt-4">
                <span>アウトプット</span>
                <span>{analysisSummary.categoryStats?.output || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      analysisSummary.categoryDistribution?.output
                        ? analysisSummary.categoryDistribution.output * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </section>

          {/* 推奨事項 */}
          {analysisSummary.recommendations &&
            analysisSummary.recommendations.length > 0 && (
              <section>
                <h3 className="text-lg font-medium mb-2">推奨事項</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisSummary.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="text-gray-700">
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}
        </div>
      )}
    </div>
  );
};

export default TodoAnalysis;
