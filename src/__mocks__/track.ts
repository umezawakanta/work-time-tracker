export type CtaId =
  | 'hero_primary_start_now'
  | 'hero_secondary_setup_3min'
  | 'hero_ai_suggest_today'
  | (string & {});

export interface CtaClickPayload {
  id: CtaId;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | string;
  location?: string;
  page?: string;
  params?: Record<string, string | number | boolean | null>;
}

export function trackCtaClick(_payload: CtaClickPayload): void {}
export function trackPageViewHome(): void {}
export function trackAISuggestClick(_meta?: Record<string, unknown>): void {}
export function trackAISuccess(_meta?: Record<string, unknown>): void {}
export function trackAIExtractTasksClick(_meta?: Record<string, unknown>): void {}
export function trackAIExtractTasksSuccess(_meta?: Record<string, unknown>): void {}
export function trackAIExtractTasksError(_meta?: Record<string, unknown>): void {}
