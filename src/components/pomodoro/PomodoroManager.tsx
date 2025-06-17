import React from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroFloatingButton } from './PomodoroFloatingButton';
import { FloatingPomodoroTimer } from './FloatingPomodoroTimer';
import { CompletionModal } from './CompletionModal';
import { PomodoroMode } from '@/types/pomodoro';

export const PomodoroManager: React.FC = () => {
  console.log('🔄 PomodoroManager: コンポーネントレンダリング開始');
  const pomodoro = usePomodoro();
  console.log('🔄 PomodoroManager: usePomodoro結果', {
    instanceId: pomodoro.instanceId,
    isVisible: pomodoro.isVisible,
    status: pomodoro.status,
    currentTaskName: pomodoro.currentTaskName,
  });

  // Add global debug function for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).clearPomodoroStorage = () => {
        console.log('🧹 Global debug: Clearing Pomodoro localStorage...');
        localStorage.removeItem('pomodoro-visibility');
        localStorage.removeItem('pomodoro-settings');
        localStorage.removeItem('pomodoro-position');
        console.log('✅ Global debug: Pomodoro localStorage cleared');
        window.location.reload();
      };
      console.log('🛠️ Debug: window.clearPomodoroStorage() function available');
    }
  }, []);

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
      {/* フローティングボタン（タイマーが非表示の時のみ表示） */}
      <PomodoroFloatingButton />

      {/* フローティングタイマー（表示設定がONの時のみ表示） */}
      {pomodoro.isVisible && <FloatingPomodoroTimer onClose={handleClose} />}

      {/* 完了モーダル */}
      <CompletionModal
        isOpen={pomodoro.showCompletionModal}
        onClose={pomodoro.closeCompletionModal}
        onStopSound={pomodoro.stopSound}
        currentMode={pomodoro.currentMode}
        nextMode={getNextMode()}
        sessionNumber={pomodoro.currentSession}
        onStartNext={handleStartNext}
        taskName={pomodoro.currentTaskName}
      />
    </>
  );
};
