import { useEffect, useMemo, useState } from 'react';

export interface QuitSmokingSettings {
  quitDateIso: string; // ISO string for consistency
  pricePerPack: number; // JPY per pack
  cigarettesPerPack: number; // usually 20
  cigarettesPerDayBeforeQuit: number; // baseline consumption
  primaryReasons: string[]; // motivations
  triggers: string[]; // known triggers
}

export interface CravingEntry {
  id: string;
  timestampIso: string;
  intensity1to10: number;
  trigger: string;
  contextNote?: string;
  resisted: boolean;
}

export type CoachRole = 'user' | 'coach' | 'system';

export interface CoachMessage {
  id: string;
  role: CoachRole;
  timestampIso: string;
  content: string;
}

export interface QuitSmokingState {
  settings: QuitSmokingSettings;
  cravings: CravingEntry[];
  messages: CoachMessage[];
  lastSlipIso?: string;
}

const LS_KEY_STATE = 'quitSmoking:state:v1';

const defaultSettings = (): QuitSmokingSettings => ({
  quitDateIso: new Date().toISOString(),
  pricePerPack: 700,
  cigarettesPerPack: 20,
  cigarettesPerDayBeforeQuit: 10,
  primaryReasons: ['健康', 'お金の節約', '集中力の向上'],
  triggers: ['朝の習慣', '仕事の休憩', '食後', 'ストレス', '飲酒時'],
});

const initialState = (): QuitSmokingState => ({
  settings: defaultSettings(),
  cravings: [],
  messages: [
    {
      id: 'welcome',
      role: 'system',
      timestampIso: new Date().toISOString(),
      content:
        'ようこそ。ここは禁煙コーチです。禁煙開始日を設定し、吸いたくなった時は「今すぐ吸いたい」ボタンを押してください。一緒に乗り越えましょう。',
    },
  ],
});

function loadStateFromLocalStorage(): QuitSmokingState {
  try {
    const raw = localStorage.getItem(LS_KEY_STATE);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as QuitSmokingState;
    // Basic migration/validation
    return {
      settings: { ...defaultSettings(), ...(parsed.settings || {}) },
      cravings: Array.isArray(parsed.cravings) ? parsed.cravings : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : initialState().messages,
      lastSlipIso: parsed.lastSlipIso,
    };
  } catch {
    return initialState();
  }
}

function saveStateToLocalStorage(state: QuitSmokingState): void {
  localStorage.setItem(LS_KEY_STATE, JSON.stringify(state));
}

export interface QuitSmokingStats {
  secondsSinceQuit: number;
  daysSinceQuit: number;
  moneySaved: number; // JPY
  cigarettesAvoided: number;
}

function computeStats(settings: QuitSmokingSettings, lastSlipIso?: string): QuitSmokingStats {
  const start = new Date(lastSlipIso || settings.quitDateIso).getTime();
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - start) / 1000));
  const days = seconds / 86400;
  const cigarettesPerDay = settings.cigarettesPerDayBeforeQuit;
  const pricePerCig =
    settings.cigarettesPerPack > 0 ? settings.pricePerPack / settings.cigarettesPerPack : 0;
  const avoided = Math.max(0, Math.round(cigarettesPerDay * days));
  const saved = Math.max(0, Math.round(avoided * pricePerCig));
  return {
    secondsSinceQuit: seconds,
    daysSinceQuit: days,
    moneySaved: saved,
    cigarettesAvoided: avoided,
  };
}

export interface UseQuitSmokingReturn {
  state: QuitSmokingState;
  stats: QuitSmokingStats;
  updateSettings: (partial: Partial<QuitSmokingSettings>) => void;
  logCraving: (entry: Omit<CravingEntry, 'id' | 'timestampIso'>) => void;
  appendMessage: (role: CoachRole, content: string) => void;
  registerSlip: (note?: string) => void; // record a slip and reset streak baseline
  resetAll: () => void;
}

export function useQuitSmoking(): UseQuitSmokingReturn {
  const [state, setState] = useState<QuitSmokingState>(() => loadStateFromLocalStorage());

  useEffect(() => {
    saveStateToLocalStorage(state);
  }, [state]);

  const stats = useMemo(
    () => computeStats(state.settings, state.lastSlipIso),
    [state.settings, state.lastSlipIso]
  );

  const updateSettings = (partial: Partial<QuitSmokingSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...partial } }));
  };

  const logCraving = (entry: Omit<CravingEntry, 'id' | 'timestampIso'>) => {
    const newEntry: CravingEntry = {
      ...entry,
      id: `craving_${Date.now()}`,
      timestampIso: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, cravings: [newEntry, ...prev.cravings].slice(0, 200) }));
  };

  const appendMessage = (role: CoachRole, content: string) => {
    const msg: CoachMessage = {
      id: `${role}_${Date.now()}`,
      role,
      timestampIso: new Date().toISOString(),
      content,
    };
    setState((prev) => ({ ...prev, messages: [...prev.messages, msg].slice(-200) }));
  };

  const registerSlip = (note?: string) => {
    setState((prev) => ({ ...prev, lastSlipIso: new Date().toISOString() }));
    if (note) {
      appendMessage('system', `スリップを記録: ${note}`);
    }
  };

  const resetAll = () => {
    setState(initialState());
  };

  return { state, stats, updateSettings, logCraving, appendMessage, registerSlip, resetAll };
}

export function formatDurationJP(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0 || parts.length) parts.push(`${hours}時間`);
  if (minutes > 0 || parts.length) parts.push(`${minutes}分`);
  parts.push(`${seconds}秒`);
  return parts.join(' ');
}
