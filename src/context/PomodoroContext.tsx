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

  const contextValue = useMemo(() => ({ pomodoro }), [pomodoro]);

  if (process.env.NODE_ENV === 'development') {
    console.log('🏭 PomodoroProvider: コンテキスト初期化', {
      instanceId: pomodoro.instanceId,
      isVisible: pomodoro.isVisible,
      status: pomodoro.status,
    });
  }

  return <PomodoroContext.Provider value={contextValue}>{children}</PomodoroContext.Provider>;
};

export const usePomodoroContext = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 usePomodoroContext: コンテキスト取得', {
      instanceId: context.pomodoro.instanceId,
      isVisible: context.pomodoro.isVisible,
      status: context.pomodoro.status,
    });
  }

  return context;
};
