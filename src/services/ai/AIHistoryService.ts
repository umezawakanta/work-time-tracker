// src/services/ai/AIHistoryService.ts
import { openDB, IDBPDatabase } from 'idb';

export type AIProviderName = 'openai' | 'anthropic' | 'gemini' | 'local';

export interface AIInteractionRequest {
  prompt: string;
  messages?: unknown;
}

export interface AIInteractionResponse {
  text?: string;
  raw?: unknown;
}

export interface AIInteractionError {
  message: string;
  code?: string;
  status?: number;
}

export interface AIInteractionEntry {
  id: string;
  provider: AIProviderName;
  model?: string;
  request: AIInteractionRequest;
  response?: AIInteractionResponse;
  error?: AIInteractionError;
  createdAt: number;
  durationMs?: number;
  context?: {
    feature?: string; // e.g. 'analyzeProductivity', 'blogAnalysis'
    route?: string;
  };
}

interface SaveInteractionInput {
  provider: AIProviderName;
  model?: string;
  request: AIInteractionRequest;
  response?: AIInteractionResponse;
  error?: AIInteractionError;
  createdAt?: number;
  durationMs?: number;
  context?: AIInteractionEntry['context'];
}

const DB_NAME = 'ai-history-db';
const STORE_NAME = 'interactions';
const DB_VERSION = 1;
const MAX_ENTRIES = 500; // 軽量ローカル保持の上限

class AIHistoryServiceImpl {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private enabled: boolean = (() => {
    // Avoid parsing `import.meta` in Jest/CommonJS by using indirect eval
    try {
      const viteMeta = (0, eval)('import.meta') as { env?: Record<string, unknown> } | undefined;
      const raw = (viteMeta?.env as Record<string, unknown> | undefined)?.[
        'VITE_AI_HISTORY_ENABLED'
      ] as string | undefined;
      // Enabled by default in Vite runtime unless explicitly set to 'false'
      return raw !== 'false';
    } catch {
      // Non-Vite (Node/Jest) default: disabled
      return false;
    }
  })();

  private getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt');
            store.createIndex('provider', 'provider');
          }
        },
      });
    }
    return this.dbPromise;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async saveInteraction(input: SaveInteractionInput): Promise<string | null> {
    if (!this.enabled) return null;
    const db = await this.getDB();
    const id = this.generateId();
    const entry: AIInteractionEntry = {
      id,
      provider: input.provider,
      model: input.model,
      request: this.redactRequest(input.request),
      response: input.response ? this.redactResponse(input.response) : undefined,
      error: input.error,
      createdAt: input.createdAt ?? Date.now(),
      durationMs: input.durationMs,
      context: input.context,
    };

    await db.put(STORE_NAME, entry);
    await this.enforceLimit(db);
    return id;
  }

  async listInteractions(params?: {
    limit?: number;
    provider?: AIProviderName;
  }): Promise<AIInteractionEntry[]> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const all: AIInteractionEntry[] = await store.getAll();

    const filtered = params?.provider ? all.filter((e) => e.provider === params.provider) : all;

    const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);
    const limited = params?.limit ? sorted.slice(0, params.limit) : sorted;
    await tx.done;
    return limited;
  }

  async getInteraction(id: string): Promise<AIInteractionEntry | undefined> {
    const db = await this.getDB();
    return db.get(STORE_NAME, id);
  }

  async deleteInteraction(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    await db.clear(STORE_NAME);
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private async enforceLimit(db: IDBPDatabase): Promise<void> {
    const entries: AIInteractionEntry[] = await db.getAll(STORE_NAME);
    if (entries.length <= MAX_ENTRIES) return;
    const sortedAsc = entries.sort((a, b) => a.createdAt - b.createdAt);
    const toDelete = sortedAsc.slice(0, entries.length - MAX_ENTRIES);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const e of toDelete) {
      await tx.store.delete(e.id);
    }
    await tx.done;
  }

  private redactRequest(req: AIInteractionRequest): AIInteractionRequest {
    // APIキー等はここには含めない設計だが保険として固定
    return {
      prompt: req.prompt,
      messages: req.messages,
    };
  }

  private redactResponse(res: AIInteractionResponse): AIInteractionResponse {
    return {
      text: res.text,
      raw: res.raw,
    };
  }
}

export const AIHistoryService = new AIHistoryServiceImpl();
export default AIHistoryService;
