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
  } catch (e) {
    // Do not break UX on tracking failure
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug('trackCtaClick failed:', (e as Error).message);
    }
  }
}
