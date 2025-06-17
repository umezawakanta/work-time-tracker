import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';

interface PomodoroContextType {
  pomodoro: ReturnType<typeof usePomodoro>;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

interface PomodoroProviderProps {
  children: ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({ children }) => {
  const pomodoro = usePomodoro();

  const contextValue = useMemo(
    () => ({ pomodoro }),
    [
      pomodoro.instanceId,
      pomodoro.status,
      pomodoro.isVisible,
      pomodoro.currentMode,
      pomodoro.remainingTime,
      pomodoro.totalTime,
      pomodoro.currentSession,
      pomodoro.completedSessions.length,
      pomodoro.isMinimized,
      pomodoro.showCompletionModal,
      pomodoro.currentTaskName,
      pomodoro.progress,
      pomodoro.position.x,
      pomodoro.position.y,
      pomodoro.settings.workDuration,
      pomodoro.settings.shortBreakDuration,
      pomodoro.settings.longBreakDuration,
      pomodoro.settings.longBreakInterval,
      pomodoro.settings.autoStartBreaks,
      pomodoro.settings.autoStartPomodoros,
      pomodoro.settings.notificationSound,
      pomodoro.settings.volume,
      pomodoro.settings.autoRecordWorkTime,
      pomodoro.todayStats.completedPomodoros,
      pomodoro.todayStats.totalFocusTime,
    ]
  );

  console.log('🏭 PomodoroProvider: コンテキスト初期化', {
    instanceId: pomodoro.instanceId,
    isVisible: pomodoro.isVisible,
    status: pomodoro.status,
  });

  return <PomodoroContext.Provider value={contextValue}>{children}</PomodoroContext.Provider>;
};

export const usePomodoroContext = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }

  console.log('🔗 usePomodoroContext: コンテキスト取得', {
    instanceId: context.pomodoro.instanceId,
    isVisible: context.pomodoro.isVisible,
    status: context.pomodoro.status,
  });

  return context;
};
