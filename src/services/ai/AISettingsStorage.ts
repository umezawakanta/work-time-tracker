// src/services/ai/AISettingsStorage.ts
// Local storage for AI provider settings (keys/models). Best-effort obfuscation (base64).

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
}

export interface AISettings {
  gemini?: ProviderConfig;
  openai?: ProviderConfig;
  anthropic?: ProviderConfig; // Claude
  updatedAt?: number;
}

const STORAGE_KEY = 'ai_settings_v1';

function b64encode(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch {
    return value;
  }
}

function b64decode(value: string): string {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return value;
  }
}

function mask(value?: string): string | undefined {
  if (!value) return undefined;
  const len = value.length;
  if (len <= 4) return '••••';
  return '••••' + value.slice(-4);
}

export const AISettingsStorage = {
  load(): AISettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as AISettings;
      // decode api keys
      const decodeProvider = (p?: ProviderConfig): ProviderConfig | undefined =>
        p ? { apiKey: p.apiKey ? b64decode(p.apiKey) : undefined, model: p.model } : undefined;
      return {
        gemini: decodeProvider(parsed.gemini),
        openai: decodeProvider(parsed.openai),
        anthropic: decodeProvider(parsed.anthropic),
        updatedAt: parsed.updatedAt,
      };
    } catch {
      return {};
    }
  },

  save(settings: AISettings): void {
    const encodeProvider = (p?: ProviderConfig): ProviderConfig | undefined =>
      p ? { apiKey: p.apiKey ? b64encode(p.apiKey) : undefined, model: p.model } : undefined;
    const toSave: AISettings = {
      gemini: encodeProvider(settings.gemini),
      openai: encodeProvider(settings.openai),
      anthropic: encodeProvider(settings.anthropic),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  mask,
};

export default AISettingsStorage;
