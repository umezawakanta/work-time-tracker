import React, { memo } from 'react';
import { usePomodoroContext } from '@/context/PomodoroContext';
import { PomodoroFloatingButton } from './PomodoroFloatingButton';
import { FloatingPomodoroTimer } from './FloatingPomodoroTimer';
import { CompletionModal } from './CompletionModal';
import { PomodoroMode } from '@/types/pomodoro';
import { pomodoroWorkTimeIntegration } from '@/services/PomodoroWorkTimeIntegrationService';
import { store } from '@/store';
import { fetchWorkTimeEntries } from '@/store/workTimeSlice';

const PomodoroManagerComponent: React.FC = () => {
  const { pomodoro } = usePomodoroContext();

  // デバッグ関数をグローバルに登録（開発環境のみ）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // すでに登録されている場合はスキップ
    if (!(window as any).clearPomodoroStorage) {
      (window as any).clearPomodoroStorage = () => {
        pomodoro.clearPomodoroStorage();
        window.location.reload();
      };
    }

    if (!(window as any).showPomodoroEntries) {
      (window as any).showPomodoroEntries = () => {
        const entries = localStorage.getItem('pomodoro-work-entries');
        if (entries) {
          const parsed = JSON.parse(entries);
          console.log('💾 ローカルストレージ保存済みエントリ:', parsed.length, '件');
          console.table(parsed);

          // 今日のエントリをフィルタ
          const today = new Date().toISOString().split('T')[0];
          const todayEntries = parsed.filter((e: any) => e.date === today);
          console.log('📅 今日のエントリ:', todayEntries.length, '件');
          if (todayEntries.length > 0) {
            console.table(todayEntries);
          }
        } else {
          console.log('❌ Pomodoro entries not found in localStorage');
        }
      };
    }

    if (!(window as any).clearPomodoroEntries) {
      (window as any).clearPomodoroEntries = () => {
        localStorage.removeItem('pomodoro-work-entries');
        console.log('🧹 Pomodoro entries cleared');
      };
    }

    if (!(window as any).getPomodoroStats) {
      (window as any).getPomodoroStats = () => {
        // Import and use the service to get stats
        import('@/services/PomodoroWorkTimeIntegrationService').then((module) => {
          module.PomodoroWorkTimeIntegrationService.getInstance()
            .getTodayPomodoroStats()
            .then((stats) => {
              console.log('📊 Today Pomodoro Stats:', stats);
            });
        });
      };
    }

    // 作業時間記録状況の詳細確認機能を追加
    if (!(window as any).checkWorkTimeRecording) {
      (window as any).checkWorkTimeRecording = () => {
        const settings = localStorage.getItem('pomodoro-settings');
        const entries = localStorage.getItem('pomodoro-work-entries');

        console.log('🔍 作業時間記録設定確認:');
        if (settings) {
          const parsed = JSON.parse(settings);
          console.log('⚙️ autoRecordWorkTime:', parsed.autoRecordWorkTime);
        }

        console.log('💾 保存済み作業エントリ数:', entries ? JSON.parse(entries).length : 0);

        if (entries) {
          const parsed = JSON.parse(entries);

          // データの妥当性チェック
          const invalidEntries = parsed.filter((entry: any) => {
            const hasInvalidTime = entry.startTime && !/^\d{2}:\d{2}$/.test(entry.startTime);
            const hasInvalidDate = entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date);
            return hasInvalidTime || hasInvalidDate;
          });

          if (invalidEntries.length > 0) {
            console.warn('⚠️ 無効なデータが検出されました:', invalidEntries.length, '件');
            console.log('🧹 window.fixPomodoroData() を実行してデータを修正してください');
          }

          const latest = parsed[parsed.length - 1];
          if (latest) {
            console.log('🕐 最新エントリ:', {
              date: latest.date,
              time: `${latest.startTime} - ${latest.endTime}`,
              project: latest.projectName,
              description: latest.description,
              duration: `${Math.round(latest.duration / 60)}分`,
            });
          }
        }
      };
    }

    // 無効データ修正機能を追加
    if (!(window as any).fixPomodoroData) {
      (window as any).fixPomodoroData = () => {
        const entries = localStorage.getItem('pomodoro-work-entries');
        if (!entries) {
          console.log('📭 修正対象のデータがありません');
          return;
        }

        try {
          const parsed = JSON.parse(entries);
          let fixedCount = 0;

          const fixedEntries = parsed.map((entry: any) => {
            const fixed = { ...entry };
            let needsFix = false;

            // startTimeとendTimeの修正
            if (entry.startTime && !/^\d{2}:\d{2}$/.test(entry.startTime)) {
              try {
                const date = new Date(entry.startTime);
                fixed.startTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                needsFix = true;
              } catch (error) {
                fixed.startTime = '09:00'; // デフォルト値
                needsFix = true;
              }
            }

            if (entry.endTime && !/^\d{2}:\d{2}$/.test(entry.endTime)) {
              try {
                const date = new Date(entry.endTime);
                fixed.endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                needsFix = true;
              } catch (error) {
                // startTimeから duration を使って計算
                const startDate = new Date(`2024-01-01T${fixed.startTime}:00`);
                const endDate = new Date(startDate.getTime() + (entry.duration || 3600) * 1000);
                fixed.endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                needsFix = true;
              }
            }

            // dateの修正
            if (entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
              try {
                const date = new Date(entry.date);
                fixed.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                needsFix = true;
              } catch (error) {
                fixed.date = new Date().toISOString().split('T')[0]; // 今日の日付
                needsFix = true;
              }
            }

            if (needsFix) fixedCount++;
            return fixed;
          });

          localStorage.setItem('pomodoro-work-entries', JSON.stringify(fixedEntries));
          console.log(`✅ ${fixedCount}件のデータを修正しました`);
          console.log('🔄 ページをリロードしてください');
        } catch (error) {
          console.error('❌ データ修正エラー:', error);
          console.log('🧹 window.clearPomodoroEntries() でデータをクリアしてください');
        }
      };
    }

    // Redux store の作業時間エントリ確認機能を追加
    if (!(window as any).checkReduxWorkTimeEntries) {
      (window as any).checkReduxWorkTimeEntries = () => {
        const state = (window as any).__store?.getState() || store.getState();
        const workTimeEntries = state.workTime?.entries || [];
        const isLoading = state.workTime?.isLoading || false;
        const error = state.workTime?.error || null;

        console.log('🔍 Redux WorkTime Store 状況:', {
          entriesCount: workTimeEntries.length,
          isLoading,
          error,
          entries: workTimeEntries.map((entry: any) => ({
            id: entry._id,
            date: entry.date,
            time: `${entry.startTime} - ${entry.endTime}`,
            project: entry.projectName,
            duration: entry.duration ? `${Math.round(entry.duration / 60)}分` : 'N/A',
            isFromPomodoro: entry.isFromPomodoro || false,
          })),
        });

        if (workTimeEntries.length === 0) {
          console.log('⚠️ Redux storeに作業時間エントリがありません');
          console.log('🔄 fetchWorkTimeEntries を実行してデータを取得してください');
        }
      };
    }

    // Redux store から最新データを強制取得する機能
    if (!(window as any).refreshWorkTimeData) {
      (window as any).refreshWorkTimeData = () => {
        store.dispatch(fetchWorkTimeEntries());
        console.log('🔄 作業時間データの再取得を開始しました');
        setTimeout(() => {
          (window as any).checkReduxWorkTimeEntries();
        }, 2000);
      };
    }
  }

  // 次のモードを計算
  const getNextMode = (): PomodoroMode => {
    if (pomodoro.currentMode === 'work') {
      const shouldTakeLongBreak =
        pomodoro.currentSession % pomodoro.settings.longBreakInterval === 0;
      return shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
    } else {
      return 'work';
    }
  };

  const handleStartNext = () => {
    const nextMode = getNextMode();
    pomodoro.switchMode(nextMode);
    pomodoro.startTimer();
  };

  const handleClose = () => {
    console.log('🚪 PomodoroManager: handleClose実行 - toggleVisibility呼び出し', {
      instanceId: pomodoro.instanceId,
      currentVisibility: pomodoro.isVisible,
    });
    pomodoro.toggleVisibility();
  };

  return (
    <>
      {/* フローティングボタン（タイマーが非表示の時に表示） */}
      <PomodoroFloatingButton />

      {/* フローティングタイマー（表示状態の時のみ） */}
      {pomodoro.isVisible && <FloatingPomodoroTimer />}

      {/* 完了モーダル */}
      {pomodoro.showCompletionModal && <CompletionModal />}
    </>
  );
};

export const PomodoroManager = memo(PomodoroManagerComponent);
