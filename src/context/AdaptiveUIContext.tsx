import React, { createContext, useContext, ReactNode } from 'react';

type AdaptiveUIContextType = object;

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

export const AdaptiveUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: AdaptiveUIContextType = {};

  return <AdaptiveUIContext.Provider value={value}>{children}</AdaptiveUIContext.Provider>;
};

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (context === undefined) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};
