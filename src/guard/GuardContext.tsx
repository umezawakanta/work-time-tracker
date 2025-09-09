import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { GuardSettings } from './types';

const DEFAULT: GuardSettings = {
  enabled: import.meta.env.VITE_DOPAMINE_GUARD === 'true',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  schedules: [],
  blockRoutes: [],
  blockCategories: [],
  whitelistDuringFocus: [],
  panicUntil: null,
};

type Ctx = {
  settings: GuardSettings;
  setSettings: (s: GuardSettings) => void;
  isPanic: boolean;
  tempUnlockedUntil?: number | null; // ms epoch
  setTempUnlockedUntil: (t: number | null) => void;
};

const GuardContext = createContext<Ctx | null>(null);

export const GuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GuardSettings>(() => {
    try {
      return JSON.parse(localStorage.getItem('guard:settings') || 'null') || DEFAULT;
    } catch {
      return DEFAULT;
    }
  });
  const [tempUnlockedUntil, setTempUnlockedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem('guard:tempUnlockUntil');
    return v ? Number(v) : null;
  });
  const isPanic = !!(settings.panicUntil && Date.now() < Date.parse(settings.panicUntil));

  useEffect(() => {
    localStorage.setItem('guard:settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    if (tempUnlockedUntil) localStorage.setItem('guard:tempUnlockUntil', String(tempUnlockedUntil));
    else localStorage.removeItem('guard:tempUnlockUntil');
  }, [tempUnlockedUntil]);

  const value = useMemo<Ctx>(
    () => ({ settings, setSettings, isPanic, tempUnlockedUntil, setTempUnlockedUntil }),
    [settings, isPanic, tempUnlockedUntil]
  );
  return <GuardContext.Provider value={value}>{children}</GuardContext.Provider>;
};

export const useGuardContext = () => {
  const ctx = useContext(GuardContext);
  if (!ctx) throw new Error('GuardContext missing');
  return ctx;
};
