'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLocale } from '../hooks/useLocale';
import { WorkTimeList } from '@/components/list/WorkTimeList';
import { WorkTimeCharts } from '@/components/chart/WorkTimeChars';
import { PomodoroStatsWidget } from '@/components/pomodoro/PomodoroStatsWidget';
import { useReportData } from '@/hooks/useReportData';

export default function WorkTimeReports() {
  const { locale } = useLocale();
  const workTimeEntries = useSelector((state: RootState) => state.workTime.entries);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useReportData();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load work time report data:', err);
        setError('Failed to load work time report data. Please try again.');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間レポート</h1>

      {/* ポモドーロ統計 */}
      <div className="mb-6">
        <PomodoroStatsWidget />
      </div>

      <WorkTimeCharts workTimeEntries={workTimeEntries} locale={locale} />

      {workTimeEntries.length > 0 ? (
        <WorkTimeList workTimeEntries={workTimeEntries} />
      ) : (
        <div className="text-center mt-4">作業時間のエントリがありません</div>
      )}
    </div>
  );
}
