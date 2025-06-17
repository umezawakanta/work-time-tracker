'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useLocale } from '../hooks/useLocale';
import { WorkTimeList } from '@/components/list/WorkTimeList';
import { WorkTimeCharts } from '@/components/chart/WorkTimeChars';
import { PomodoroStatsWidget } from '@/components/pomodoro/PomodoroStatsWidget';
import { useReportData } from '@/hooks/useReportData';
import { fetchWorkTimeEntries } from '@/store/workTimeSlice';

export default function WorkTimeReports() {
  const { locale } = useLocale();
  const workTimeEntries = useSelector((state: RootState) => state.workTime.entries);
  const isLoading = useSelector((state: RootState) => state.workTime.isLoading);
  const error = useSelector((state: RootState) => state.workTime.error);
  const dispatch = useDispatch<AppDispatch>();

  useReportData();

  useEffect(() => {
    // ページ表示時に最新データを取得
    dispatch(fetchWorkTimeEntries());
  }, [dispatch]);

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
