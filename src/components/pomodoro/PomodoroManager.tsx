import React from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroFloatingButton } from './PomodoroFloatingButton';
import { FloatingPomodoroTimer } from './FloatingPomodoroTimer';
import { CompletionModal } from './CompletionModal';
import { PomodoroMode } from '@/types/pomodoro';

export const PomodoroManager: React.FC = () => {
  const pomodoro = usePomodoro();

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

  return (
    <>
      {/* フローティングボタン（タイマーが非表示の時のみ表示） */}
      <PomodoroFloatingButton />

      {/* フローティングタイマー（表示設定がONの時のみ表示） */}
      {pomodoro.isVisible && <FloatingPomodoroTimer onClose={() => pomodoro.toggleVisibility()} />}

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
