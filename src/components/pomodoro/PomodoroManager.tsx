import React, { memo } from 'react';
import { usePomodoroContext } from '@/context/PomodoroContext';
import { PomodoroFloatingButton } from './PomodoroFloatingButton';
import { FloatingPomodoroTimer } from './FloatingPomodoroTimer';
import { CompletionModal } from './CompletionModal';
import { PomodoroMode } from '@/types/pomodoro';
import { pomodoroWorkTimeIntegration } from '@/services/PomodoroWorkTimeIntegrationService';

const PomodoroManagerComponent: React.FC = () => {
  const { pomodoro } = usePomodoroContext();

  // デバッグ関数をグローバルに登録（開発環境のみ）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // すでに登録されている場合はスキップ
    if (!window.clearPomodoroStorage) {
      window.clearPomodoroStorage = () => {
        pomodoro.clearPomodoroStorage();
        window.location.reload();
      };
    }

    if (!window.showPomodoroEntries) {
      window.showPomodoroEntries = () => {
        const entries = localStorage.getItem('pomodoro-work-entries');
        if (entries) {
          console.table(JSON.parse(entries));
        } else {
          console.log('Pomodoro entries not found');
        }
      };
    }

    if (!window.clearPomodoroEntries) {
      window.clearPomodoroEntries = () => {
        localStorage.removeItem('pomodoro-work-entries');
        console.log('Pomodoro entries cleared');
      };
    }

    if (!window.getPomodoroStats) {
      window.getPomodoroStats = () => {
        // Import and use the service to get stats
        import('@/services/PomodoroWorkTimeIntegrationService').then((module) => {
          module.PomodoroWorkTimeIntegrationService.getTodayPomodoroStats().then((stats) => {
            console.log('Today Pomodoro Stats:', stats);
          });
        });
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
