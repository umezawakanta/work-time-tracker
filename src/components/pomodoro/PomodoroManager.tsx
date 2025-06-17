import React from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroFloatingButton } from './PomodoroFloatingButton';
import { FloatingPomodoroTimer } from './FloatingPomodoroTimer';

export const PomodoroManager: React.FC = () => {
  const pomodoro = usePomodoro();

  console.log('PomodoroManager: isVisible =', pomodoro.isVisible, 'status =', pomodoro.status);

  return (
    <>
      {/* フローティングボタン（タイマーが非表示の時のみ表示） */}
      <PomodoroFloatingButton />

      {/* フローティングタイマー（表示設定がONの時のみ表示） */}
      {pomodoro.isVisible && <FloatingPomodoroTimer onClose={() => pomodoro.toggleVisibility()} />}
    </>
  );
};
