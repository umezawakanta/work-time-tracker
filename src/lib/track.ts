import { userTrackingService } from '@/services/analytics/UserTrackingService';

export type CtaId =
  | 'hero_primary_start_now'
  | 'hero_secondary_setup_3min'
  | 'hero_ai_suggest_today'
  | (string & {});

export interface CtaClickPayload {
  id: CtaId;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | string;
  location?: string; // e.g., 'hero', 'footer'
  page?: string;
  params?: Record<string, string | number | boolean | null>;
}

export function trackCtaClick(payload: CtaClickPayload): void {
  try {
    userTrackingService.trackCTA(payload.id, {
      label: payload.label,
      variant: payload.variant,
      location: payload.location,
      page: payload.page,
      params: payload.params,
    });
    // Also mark funnel step when relevant
    if (payload.id === 'hero_primary_start_now' || payload.id === 'hero_secondary_setup_3min') {
      userTrackingService.trackFunnel('cta_click', {
        id: payload.id,
        location: payload.location,
        page: payload.page,
      });
    }
  } catch (e) {
    // Do not break UX on tracking failure
    try {
      const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : false;
      if (isDev) {
        console.debug('trackCtaClick failed:', (e as Error).message);
      }
    } catch {}
  }
}

export function trackPageViewHome(): void {
  try {
    userTrackingService.trackFunnel('page_view_home', {
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  } catch {}
}

export function trackAISuggestClick(meta?: Record<string, unknown>): void {
  try {
    userTrackingService.trackFunnel('ai_suggest_click', meta);
  } catch {}
}

export function trackAISuccess(meta?: Record<string, unknown>): void {
  try {
    userTrackingService.trackFunnel('ai_success', meta);
  } catch {}
}

// Blog task extraction events
export function trackAIExtractTasksClick(meta?: Record<string, unknown>): void {
  try {
    userTrackingService.trackInteraction('funnel_event', 'ai_extract_tasks_click', undefined, meta);
  } catch {}
}

export function trackAIExtractTasksSuccess(meta?: Record<string, unknown>): void {
  try {
    userTrackingService.trackInteraction(
      'funnel_event',
      'ai_extract_tasks_success',
      undefined,
      meta
    );
  } catch {}
}

export function trackAIExtractTasksError(meta?: Record<string, unknown>): void {
  try {
    userTrackingService.trackInteraction('funnel_event', 'ai_extract_tasks_error', undefined, meta);
  } catch {}
}
