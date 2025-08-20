// src/services/ai/BlogTaskExtractionService.ts
// Extract actionable tasks from blog content using an AI provider (if available)
// Falls back to lightweight bullet-point extraction when AI is unavailable or returns invalid JSON

import { buildTaskExtractionPrompt, SupportedLocale } from '@/services/ai/promptTemplates';
import { ExtractedTask, ExtractedTaskResult, PriorityLevel, TaskType } from '@/types/blogTask';

const MAX_DEFAULT_TASKS = 5;

function normalizePriority(value: unknown): PriorityLevel | undefined {
  if (typeof value !== 'number') return undefined;
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return clamped as PriorityLevel;
}

function normalizeType(value: unknown): TaskType | undefined {
  if (value === 'input' || value === 'output') return value;
  return undefined;
}

function guessTypeFromTitle(title: string): TaskType {
  const t = title.toLowerCase();
  const inputHints = [
    'learn',
    'read',
    'research',
    'watch',
    '調査',
    '学ぶ',
    '読む',
    '確認',
    'watch',
  ];
  for (const h of inputHints) {
    if (t.includes(h)) return 'input';
  }
  return 'output';
}

function isLikelyISODateString(value: unknown): value is string {
  return typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

function coerceISODate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  // Try Date parsing; if invalid, drop
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function ensureUniqueTitles(tasks: ExtractedTask[], max: number): ExtractedTask[] {
  const seen = new Set<string>();
  const result: ExtractedTask[] = [];
  for (const task of tasks) {
    const key = task.title.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(task);
    if (result.length >= max) break;
  }
  return result;
}

function parseJsonTasks(raw: string, maxTasks: number): ExtractedTaskResult | null {
  try {
    // Attempt direct JSON parse first
    const direct = JSON.parse(raw);
    if (direct && Array.isArray((direct as { tasks?: unknown }).tasks)) {
      return sanitizeTasks((direct as { tasks: unknown }).tasks, maxTasks);
    }
  } catch {}

  // Try to extract JSON object from text
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]);
      if (obj && Array.isArray(obj.tasks)) {
        return sanitizeTasks(obj.tasks, maxTasks);
      }
    } catch {}
  }
  return null;
}

function sanitizeTasks(rawTasks: unknown, maxTasks: number): ExtractedTaskResult {
  if (!Array.isArray(rawTasks)) return { tasks: [] };
  const cleaned: ExtractedTask[] = rawTasks
    .map((t) => {
      const title =
        typeof (t as { title?: unknown }).title === 'string'
          ? (t as { title: string }).title.trim()
          : '';
      if (!title) return undefined;
      const type = normalizeType((t as { type?: unknown }).type) ?? guessTypeFromTitle(title);
      const priority = normalizePriority((t as { priority?: unknown }).priority);
      const dueRaw = (t as { dueDate?: unknown }).dueDate;
      const dueDate = isLikelyISODateString(dueRaw) ? (dueRaw as string) : coerceISODate(dueRaw);
      const notes =
        typeof (t as { notes?: unknown }).notes === 'string'
          ? (t as { notes: string }).notes
          : undefined;
      return { title, type, priority, dueDate, notes } as ExtractedTask;
    })
    .filter((x): x is ExtractedTask => Boolean(x));

  return { tasks: ensureUniqueTitles(cleaned, maxTasks) };
}

function fallbackExtractFromText(text: string, maxTasks: number): ExtractedTaskResult {
  const lines = text.split(/\r?\n/);
  const candidates: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•・]\s+/.test(trimmed)) {
      const title = trimmed
        .replace(/^[-*•・]\s+/, '')
        .replace(/^\[[ xX]?\]\s*/, '')
        .trim();
      if (title.length >= 2) candidates.push(title);
    }
    if (candidates.length >= maxTasks) break;
  }

  const tasks: ExtractedTask[] = candidates.map((title) => ({
    title,
    type: guessTypeFromTitle(title),
  }));
  return { tasks: ensureUniqueTitles(tasks, maxTasks) };
}

export interface ExtractOptions {
  locale?: SupportedLocale;
  maxTasks?: number;
}

export async function extractFromContent(
  content: string,
  options?: ExtractOptions
): Promise<ExtractedTaskResult> {
  const maxTasks = options?.maxTasks ?? MAX_DEFAULT_TASKS;
  const locale: SupportedLocale = options?.locale ?? 'ja';
  const safeContent = (content || '').trim();
  if (!safeContent) return { tasks: [] };

  const prompt = buildTaskExtractionPrompt({ content: safeContent, maxTasks, locale });

  try {
    const { default: AdvancedAIService } = await import('@/services/ai/AdvancedAIService');
    const aiText: string = await AdvancedAIService.generateResponse(prompt);
    const parsed = parseJsonTasks(aiText, maxTasks);
    if (parsed) return parsed;
    // fallback on AI response text bullets
    return fallbackExtractFromText(aiText, maxTasks);
  } catch {
    // AI not available or failed → local fallback from original content
    return fallbackExtractFromText(safeContent, maxTasks);
  }
}

export default {
  extractFromContent,
};
