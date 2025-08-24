import React from 'react';
import { Target, AlertCircle } from 'lucide-react';

interface WeeklySchedule {
  weekNumber: number;
  totalPlannedHours: number;
  plannedBadges: any[];
  onTrackScore: number;
  theme: string;
  startDate: string;
  endDate: string;
  riskLevel: string;
  efficiency: number;
  completionRate: number;
  keyMilestones: string[];
  notes: string;
}

// 週次ビューのマイルストーンと注意事項部分
const renderWeeklyMilestonesAndNotes = (week: WeeklySchedule) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h4 className="font-semibold mb-2 flex items-center gap-1">
        <Target className="w-4 h-4" />
        🎯 キーマイルストーン
      </h4>
      <ul className="text-sm space-y-1">
        {week.keyMilestones.map((milestone, index) => (
          <li key={index} className="flex items-start gap-2">
            <Target className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
            <span>{milestone}</span>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-2">📝 週の特記事項</h4>
      <p className="text-sm text-muted-foreground">{week.notes}</p>

      {/* リスク警告 */}
      {week.riskLevel !== 'low' && (
        <div
          className={`mt-3 p-2 rounded-lg text-xs ${
            week.riskLevel === 'high' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          <div className="flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            {week.riskLevel === 'high' ? '高リスク' : '中リスク'}警告
          </div>
          <div className="mt-1">
            {week.riskLevel === 'high'
              ? 'この週は予定通り進まない可能性が高いです。予備時間の確保を推奨します。'
              : 'この週は少し注意が必要です。進捗を密にモニタリングしてください。'}
          </div>
        </div>
      )}
    </div>
  </div>
);
