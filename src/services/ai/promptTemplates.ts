// src/services/ai/promptTemplates.ts
// Strictly-typed prompt templates used by AI providers

export type SupportedLocale = 'ja' | 'en';

// =============== 最重要タスク（Priority Task) ===============
export interface PriorityTaskPromptInput {
  situation?: string; // 現在の状況（テキスト）
  goals?: string[]; // 中長期ゴール
  recentTasks?: string[]; // 最近のタスク履歴
  constraints?: string[]; // 制約（締切/体調など）
  locale?: SupportedLocale;
}

export function buildPriorityTaskPrompt(input: PriorityTaskPromptInput): string {
  const locale: SupportedLocale = input.locale ?? 'ja';
  const situation = input.situation?.trim() || '（特になし）';
  const goals = input.goals && input.goals.length > 0 ? `- Goals: ${input.goals.join(', ')}` : '';
  const recent =
    input.recentTasks && input.recentTasks.length > 0
      ? `- Recent Tasks: ${input.recentTasks.join(', ')}`
      : '';
  const constraints =
    input.constraints && input.constraints.length > 0
      ? `- Constraints: ${input.constraints.join(', ')}`
      : '';

  if (locale === 'en') {
    return [
      'You are a productivity coach. Based on the context below, return exactly one "Most Important Task" for today.',
      'Return ONLY valid JSON with the following shape and no extra text:',
      '{"task": string, "reason": string}',
      '',
      'Context:',
      `- Situation: ${situation}`,
      goals,
      recent,
      constraints,
      '',
      'Constraints:',
      '- Be concise and actionable',
      '- Prefer tasks with high impact or urgent deadlines',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // ja
  return [
    'あなたは生産性コーチです。以下の状況を踏まえ、今日の「最重要タスク」を1件だけ提案してください。',
    '出力はJSONのみ。以下の形式に厳密に従ってください:',
    '{"task": string, "reason": string}',
    '',
    'コンテキスト:',
    `- 状況: ${situation}`,
    goals,
    recent,
    constraints,
    '',
    '制約:',
    '- 具体的・実行可能・簡潔',
    '- 影響が大きい/期限が近いものを優先',
  ]
    .filter(Boolean)
    .join('\n');
}

// =============== 習慣提案（Habit Suggestions） ===============
export interface HabitSuggestionPromptInput {
  currentHabits?: string[]; // 現在の習慣（例: 朝散歩, 25分集中など）
  stats?: {
    avgFocusMinutesPerDay?: number;
    completedDaysLastWeek?: number;
    streakDays?: number;
  };
  limit?: number; // 提案数の上限
  locale?: SupportedLocale;
}

export function buildHabitSuggestionPrompt(input: HabitSuggestionPromptInput): string {
  const locale: SupportedLocale = input.locale ?? 'ja';
  const habitsLine = input.currentHabits?.length
    ? `- Current habits: ${input.currentHabits.join(', ')}`
    : '';
  const stats = input.stats ?? {};
  const limit = input.limit ?? 3;

  if (locale === 'en') {
    return [
      'You are a behavioral coach. Suggest practical habit improvements tailored to the user context.',
      `Return ONLY valid JSON: {"suggestions": Array<{"habit": string, "reason": string}>} (max ${limit})`,
      '',
      'Context:',
      habitsLine,
      `- Avg focus minutes/day: ${stats.avgFocusMinutesPerDay ?? 'unknown'}`,
      `- Completed days last week: ${stats.completedDaysLastWeek ?? 'unknown'}`,
      `- Current streak days: ${stats.streakDays ?? 'unknown'}`,
      '',
      'Constraints:',
      '- Specific and achievable',
      '- Fit within realistic daily time budgets',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // ja
  return [
    'あなたは行動変容のコーチです。ユーザーの状況に適した「実行可能な習慣改善案」を提案してください。',
    `出力はJSONのみ。形式: {"suggestions": Array<{"habit": string, "reason": string}>}（最大 ${limit} 件）`,
    '',
    'コンテキスト:',
    habitsLine,
    `- 1日あたりの平均集中時間（分）: ${stats.avgFocusMinutesPerDay ?? '不明'}`,
    `- 先週の達成日数: ${stats.completedDaysLastWeek ?? '不明'}`,
    `- 連続達成日数: ${stats.streakDays ?? '不明'}`,
    '',
    '制約:',
    '- 具体的・実行可能・小さく始められること',
    '- 毎日の時間予算に収まること',
  ]
    .filter(Boolean)
    .join('\n');
}

// =============== 時間配分（Time Allocation / Scheduling） ===============
export interface TimeBlock {
  start: string; // e.g., "09:00"
  end: string; // e.g., "12:00"
}

export interface AllocationTask {
  title: string;
  durationMin: number; // 推定必要時間
  priority: 1 | 2 | 3 | 4 | 5; // 5が最高
}

export interface TimeAllocationPromptInput {
  timeBlocksAvailable: TimeBlock[];
  tasks: AllocationTask[];
  preferences?: string[]; // 例: 「午前は深い作業」「会議は14時以降」など
  locale?: SupportedLocale;
}

export function buildTimeAllocationPrompt(input: TimeAllocationPromptInput): string {
  const locale: SupportedLocale = input.locale ?? 'ja';
  const blocks = input.timeBlocksAvailable.map((b) => `${b.start}-${b.end}`).join(', ');
  const tasks = input.tasks
    .map((t) => `${t.title}(${t.durationMin}min, P${t.priority})`)
    .join(', ');
  const prefs = input.preferences?.length ? `- Preferences: ${input.preferences.join(', ')}` : '';

  if (locale === 'en') {
    return [
      'You are a time management expert. Allocate tasks into the available time blocks.',
      'Return ONLY valid JSON with this shape:',
      '{"schedule": Array<{"time": string, "task": string, "reason": string}>}',
      '',
      `- Available blocks: ${blocks}`,
      `- Tasks: ${tasks}`,
      prefs,
      '',
      'Guidelines:',
      '- Prioritize P5>P1 and respect durations',
      '- Keep context switching low; prefer batching',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // ja
  return [
    'あなたは時間管理の専門家です。与えられた時間枠にタスクを割り当て、1日の実行計画を作成してください。',
    '出力はJSONのみ。形式: {"schedule": Array<{"time": string, "task": string, "reason": string}>}',
    '',
    `- 利用可能な時間枠: ${blocks}`,
    `- タスク一覧: ${tasks}`,
    prefs,
    '',
    'ガイドライン:',
    '- 優先度（5が高）と所要時間を考慮',
    '- 文脈切り替えを減らし、同種の作業をまとめる',
  ]
    .filter(Boolean)
    .join('\n');
}

// =============== 集約エクスポート ===============
export const PromptTemplates = {
  buildPriorityTaskPrompt,
  buildHabitSuggestionPrompt,
  buildTimeAllocationPrompt,
};

export type PromptTemplateMap = typeof PromptTemplates;
