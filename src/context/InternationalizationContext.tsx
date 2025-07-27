import React, { createContext, useContext, ReactNode } from 'react';

type InternationalizationContextType = object;

const InternationalizationContext = createContext<InternationalizationContextType | undefined>(
  undefined
);

export const InternationalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: InternationalizationContextType = {};

  return (
    <InternationalizationContext.Provider value={value}>
      {children}
    </InternationalizationContext.Provider>
  );
};

export const useInternationalization = () => {
  const context = useContext(InternationalizationContext);
  if (context === undefined) {
    throw new Error('useInternationalization must be used within an InternationalizationProvider');
  }
  return context;
};
