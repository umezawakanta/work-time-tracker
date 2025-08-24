import { api } from './apiConfig';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AskOptions {
  model?: string;
  timeoutMs?: number;
  traits?: { iq?: number; mbti?: string };
}

export interface AskResult {
  text: string;
  raw: unknown;
}

/**
 * Send messages to the AI assistant via server proxy (/api/ai/anthropic)
 */
const DEFAULT_TIMEOUT_MS = 35000;

export async function ask(messages: ChatMessage[], options: AskOptions = {}): Promise<AskResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Math.max(1000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  );

  try {
    const response = await api.post(
      '/ai/anthropic',
      {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        model: options.model ?? 'claude-3-5-sonnet-20241022',
        system: options.traits
          ? `ユーザーの特性（IQ: ${options.traits.iq ?? '不明'}, MBTI: ${
              options.traits.mbti ?? '不明'
            }）を考慮し、丁寧で簡潔な実行可能アドバイスを返してください。`
          : '丁寧で簡潔な実行可能アドバイスを返してください。',
      },
      { signal: controller.signal }
    );

    const data = response.data as any;
    const text: string =
      (Array.isArray(data?.content) && data.content[0]?.text) ||
      (typeof data?.text === 'string' ? data.text : '') ||
      '';

    return { text, raw: data };
  } catch (error: any) {
    // Normalize error shape
    const status = error?.response?.status as number | undefined;
    const code = (error?.response?.data?.code as string | undefined) || error?.code;

    const err = new Error(
      status === 429
        ? 'RATE_LIMIT'
        : code === 'NOT_CONFIGURED'
          ? 'NOT_CONFIGURED'
          : error?.name === 'AbortError' || code === 'ECONNABORTED'
            ? 'TIMEOUT'
            : 'REQUEST_FAILED'
    );
    (err as any).status = status;
    (err as any).code = code;
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
