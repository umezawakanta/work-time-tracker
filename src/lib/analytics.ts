import { useCallback, useEffect } from 'react';

// Dev-only counters for quick success rate insights
const __devCounters = {
  ai: { ok: 0, fail: 0 },
  assess: { saved: 0, failed: 0 },
  learning: { saved: 0 },
};

type EventData = Record<string, any>;

// ------------------------------
// IDs and Queue Utilities
// ------------------------------

// Normalize and audit analytics event names
const EVENT_ALIASES: Record<string, string> = {
  // CTAs
  pricing_cta_click: 'cta_pricing_click',
  upgrade_cta_click: 'cta_upgrade_click',
  invite_nav_click: 'cta_invite_click',
  // Funnels
  funnelvisit: 'funnel_visit',
  funnelaction: 'funnel_action',
  funnelsuccess: 'funnel_success',
  // Auth
  login_successful: 'login_success',
  // Misc
  pageview: 'page_view',
};

function normalizeEventName(input: string): string {
  try {
    const base = String(input || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    return EVENT_ALIASES[base] || base;
  } catch {
    return input;
  }
}

// Safely fetch GA Measurement ID from Vite env or process env
function getGaMeasurementId(): string | undefined {
  try {
    const viteValue = (import.meta as any)?.env?.VITE_GA_MEASUREMENT_ID;
    if (typeof viteValue === 'string' && viteValue.trim().length > 0) {
      return viteValue.trim();
    }
  } catch {}
  try {
    const hasProcess = typeof process !== 'undefined';
    const procValue =
      hasProcess && (process as any)?.env?.NEXT_PUBLIC_GA_MEASUREMENT_ID
        ? (process as any).env.NEXT_PUBLIC_GA_MEASUREMENT_ID
        : undefined;
    if (typeof procValue === 'string' && procValue.trim().length > 0) {
      return procValue.trim();
    }
  } catch {}
  return undefined;
}

// Idempotent GA loader – always defines window.gtag stub to avoid ReferenceErrors
const loadGoogleAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  if ((window as any).__analytics_ga_loaded) return;
  if (!window.dataLayer) {
    try {
      (window as any).dataLayer = [];
    } catch {}
  }
  if (!window.gtag) {
    try {
      window.gtag = (_command: string, ..._args: unknown[]) => {
        try {
          const args: unknown[] = [_command, ..._args];
          ((window as any).dataLayer = (window as any).dataLayer || []).push(args);
        } catch {}
      };
    } catch {}
  }
  const gaId = getGaMeasurementId();
  if (!gaId) return;
  const existing = document.getElementById('ga-script');
  if (existing) return;
  try {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    s.id = 'ga-script';
    s.onload = () => {
      try {
        window.gtag && window.gtag('js', new Date() as unknown as string);
        window.gtag && window.gtag('config', gaId);
        (window as any).__analytics_ga_loaded = true;
      } catch {}
    };
    document.head?.appendChild(s);
  } catch {}
};

const loadMixpanel = (): void => {
  if (typeof window === 'undefined') return;
  if ((window as any).__analytics_mixpanel_loaded) return;
  let token: string | undefined;
  try {
    token = (import.meta as any)?.env?.VITE_MIXPANEL_TOKEN;
  } catch {}
  if (!token) {
    try {
      const hasProcess = typeof process !== 'undefined';
      token =
        hasProcess && (process as any)?.env?.NEXT_PUBLIC_MIXPANEL_TOKEN
          ? (process as any).env.NEXT_PUBLIC_MIXPANEL_TOKEN
          : undefined;
    } catch {}
  }
  if (!token) return;
  try {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    s.id = 'mixpanel-script';
    s.onload = () => {
      try {
        (window as any).mixpanel?.init?.(token, { debug: false });
        (window as any).__analytics_mixpanel_loaded = true;
      } catch {}
    };
    document.head?.appendChild(s);
  } catch {}
};

const loadAmplitude = (): void => {
  if (typeof window === 'undefined') return;
  if ((window as any).__analytics_amplitude_loaded) return;
  let apiKey: string | undefined;
  try {
    apiKey = (import.meta as any)?.env?.VITE_AMPLITUDE_API_KEY;
  } catch {}
  if (!apiKey) {
    try {
      const hasProcess = typeof process !== 'undefined';
      apiKey =
        hasProcess && (process as any)?.env?.NEXT_PUBLIC_AMPLITUDE_API_KEY
          ? (process as any).env.NEXT_PUBLIC_AMPLITUDE_API_KEY
          : undefined;
    } catch {}
  }
  if (!apiKey) return;
  try {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://cdn.amplitude.com/libs/amplitude-8.21.0-min.gz.js';
    s.id = 'amplitude-script';
    s.onload = () => {
      try {
        (window as any).amplitude?.getInstance?.().init?.(apiKey);
        (window as any).__analytics_amplitude_loaded = true;
      } catch {}
    };
    document.head?.appendChild(s);
  } catch {}
};

function getClientId(): string | undefined {
  try {
    const key = 'analytics:client_id';
    let clientId = localStorage.getItem(key);
    if (!clientId) {
      clientId = 'cid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, clientId);
    }
    return clientId;
  } catch {
    return undefined;
  }
}

function getSessionId(): string | undefined {
  try {
    const key = 'analytics:session_id';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
  } catch {
    return undefined;
  }
}

type QueuedEvent = {
  endpoint: '/api/analytics/track' | '/api/analytics/pageview';
  body: Record<string, unknown>;
  createdAt: string;
  attempt?: number;
};

function readQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem('analytics:queue');
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedEvent[]): void {
  try {
    localStorage.setItem('analytics:queue', JSON.stringify(queue));
  } catch {}
}

async function postWithQueue(
  endpoint: QueuedEvent['endpoint'],
  body: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    const queue = readQueue();
    queue.push({ endpoint, body, createdAt: new Date().toISOString(), attempt: 0 });
    writeQueue(queue);
  }
}

export async function flushAnalyticsQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: QueuedEvent[] = [];
  for (const item of queue) {
    try {
      await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
    } catch {
      const attempts = (item.attempt ?? 0) + 1;
      // Keep for future retry, cap size to avoid unbounded growth
      if (attempts <= 10) remaining.push({ ...item, attempt: attempts });
    }
  }
  writeQueue(remaining.slice(-500));
}

/**
 * イベントを追跡する関数（フック不要・クラス/関数両対応）
 */
export function trackEvent(eventName: string, data: EventData = {}): void {
  const normalizedEvent = normalizeEventName(eventName);
  // 初回アクティベーション統一イベント（dev/prod共通）
  try {
    const qualifies =
      normalizedEvent === 'assessment_saved' ||
      normalizedEvent === 'learning_progress_saved' ||
      (normalizedEvent === 'ai_assistant_reply' && Boolean((data as any).ok));

    if (qualifies && typeof window !== 'undefined') {
      const key = 'activation:first_success_at';
      const existed = localStorage.getItem(key);
      if (!existed) {
        const nowIso = new Date().toISOString();
        localStorage.setItem(key, nowIso);
        // 送信（環境に応じて）
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Analytics] Event: activation_first_success', {
            source: eventName,
            at: nowIso,
          });
          try {
            if (import.meta?.env?.VITE_ENABLE_ANALYTICS === 'true') {
              fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'activation_first_success',
                  data: { source: eventName, at: nowIso, ...data },
                  timestamp: nowIso,
                }),
              }).catch(() => {});
            }
          } catch {}
        } else {
          try {
            if (window.gtag) {
              window.gtag('event', 'activation_first_success', {
                source: eventName,
                at: nowIso,
                ...data,
              });
            }
            if (window.mixpanel) {
              (window.mixpanel as any).track('activation_first_success', {
                source: eventName,
                at: nowIso,
                ...data,
              });
            }
            if (window.amplitude) {
              (window.amplitude as any)
                .getInstance()
                .logEvent('activation_first_success', { source: eventName, at: nowIso, ...data });
            }
            if (typeof fetch === 'function') {
              fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'activation_first_success',
                  data: { source: eventName, at: nowIso, ...data },
                  timestamp: nowIso,
                }),
              }).catch(() => {});
            }
          } catch {}
        }
      }
    }
  } catch {}

  // 開発環境ではコンソールに出力するだけ
  if (process.env.NODE_ENV !== 'production') {
    // Update dev counters for key flows
    try {
      switch (eventName) {
        case 'ai_assistant_reply': {
          const ok = Boolean((data as any).ok);
          if (ok) __devCounters.ai.ok++;
          else __devCounters.ai.fail++;
          break;
        }
        case 'assessment_saved':
          __devCounters.assess.saved++;
          break;
        case 'assessment_save_failed':
          __devCounters.assess.failed++;
          break;
        case 'learning_progress_saved':
          __devCounters.learning.saved++;
          break;
        case 'referral_first_action':
          // no-op counter
          break;
      }
    } catch {}
    console.log(`[Analytics] Event: ${normalizedEvent}`, data);
    // dev時もリモート送信が有効ならPOST
    try {
      if (import.meta?.env?.VITE_ENABLE_ANALYTICS === 'true') {
        const clientId = getClientId();
        const sessionId = getSessionId();
        postWithQueue('/api/analytics/track', {
          event: normalizedEvent,
          data: { ...data, clientId, sessionId },
          timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    return;
  }

  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', normalizedEvent, data);
    }

    // Mixpanel
    if (window.mixpanel) {
      (window.mixpanel as any).track(normalizedEvent, data);
    }

    // Amplitude
    if (window.amplitude) {
      (window.amplitude as any).getInstance().logEvent(normalizedEvent, data);
    }

    // カスタムデータレイヤー
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...data,
      });
    }

    // バックエンドにも保存
    if (typeof fetch === 'function') {
      const clientId = getClientId();
      const sessionId = getSessionId();
      postWithQueue('/api/analytics/track', {
        event: normalizedEvent,
        data: { ...data, clientId, sessionId },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * ページビューを追跡する関数（フック不要）
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  try {
    const clientId = getClientId();
    const sessionId = getSessionId();
    const getUtm = () => {
      try {
        const stored = localStorage.getItem('utm:first_visit');
        const storedObj = stored ? JSON.parse(stored) : {};
        const params = new URLSearchParams(window.location.search);
        const current: Record<string, string> = {};
        params.forEach((v, k) => {
          if (k.startsWith('utm_')) current[k] = v;
        });
        return { ...storedObj, ...current };
      } catch {
        return undefined;
      }
    };
    const utm = getUtm();

    // Dev: log + optionally send to local mock endpoint so admin trend works in dev
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] Page View: ${pagePath} (${pageTitle})`);
      try {
        postWithQueue('/api/analytics/pageview', {
          path: pagePath,
          title: pageTitle,
          referrer: document.referrer,
          clientId,
          sessionId,
          utm,
        });
      } catch {}
      return;
    }

    // Prod: send to GA/Mixpanel/Amplitude as before and also record to backend (best-effort)
    const gaId = getGaMeasurementId();
    if (window.gtag && gaId) {
      window.gtag('config', gaId, {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
    if (window.mixpanel) {
      (window.mixpanel as any).track('Page View', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
    if (window.amplitude) {
      (window.amplitude as any).getInstance().logEvent('Page View', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    if (typeof fetch === 'function') {
      postWithQueue('/api/analytics/pageview', {
        path: pagePath,
        title: pageTitle,
        referrer: document.referrer,
        clientId,
        sessionId,
        utm,
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

/**
 * ユーザー特性設定（フック不要）
 */
export function identifyUser(userId: string, traits: Record<string, any> = {}): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Identify User: ${userId}`, traits);
    return;
  }

  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('set', 'user_properties', traits);
      window.gtag('set', 'user_id', userId);
    }

    // Mixpanel
    if (window.mixpanel) {
      (window.mixpanel as any).identify(userId);
      (window.mixpanel as any).people.set(traits);
    }

    // Amplitude
    if (window.amplitude) {
      const identify = new (window.amplitude as any).Identify();
      Object.entries(traits).forEach(([key, value]) => {
        identify.set(key, value);
      });

      (window.amplitude as any).getInstance().setUserId(userId);
      (window.amplitude as any).getInstance().identify(identify);
    }
  } catch (error) {
    console.error('[Analytics] Error identifying user:', error);
  }
}

/**
 * アナリティクス機能を提供するカスタムフック
 * 初期化と、依存関係メモ化済みの関数群を返す
 */
export const useAnalytics = () => {
  // アナリティクスの初期化
  useEffect(() => {
    // 本番環境では実際のアナリティクスサービスを初期化
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // 例: Google Analyticsの初期化
      if (!window.gtag) {
        loadGoogleAnalytics();
      }

      // 例: Mixpanelの初期化
      if (!window.mixpanel) {
        loadMixpanel();
      }

      // 例: Amplitudeの初期化
      if (!window.amplitude) {
        loadAmplitude();
      }
    }
  }, []);

  // UTMパラメータを初回訪問時に保存
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const hasUtm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].some(
        (k) => params.has(k)
      );
      if (hasUtm && !localStorage.getItem('utm:first_visit')) {
        const utm: Record<string, string> = {};
        params.forEach((v, k) => {
          if (k.startsWith('utm_')) utm[k] = v;
        });
        utm['referrer'] = document.referrer || '';
        localStorage.setItem('utm:first_visit', JSON.stringify(utm));
      }
    } catch {}
  }, []);

  // Dev-only: periodic success summary log
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const id = setInterval(() => {
      // Print only if there was activity
      const total =
        __devCounters.ai.ok +
        __devCounters.ai.fail +
        __devCounters.assess.saved +
        __devCounters.assess.failed +
        __devCounters.learning.saved;
      if (total === 0) return;
      console.group('[Analytics] Success summary (dev)');
      console.log('AI:', __devCounters.ai);
      console.log('Assessments:', __devCounters.assess);
      console.log('Learning:', __devCounters.learning);
      console.groupEnd();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Queue flusher: try on interval, on online, and on unload
  useEffect(() => {
    const onOnline = () => void flushAnalyticsQueue();
    const onBeforeUnload = () => navigator.sendBeacon && flushAnalyticsQueue();
    const id = setInterval(() => void flushAnalyticsQueue(), 30000);
    window.addEventListener('online', onOnline);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  // ファネル用ショートカット
  const trackFunnelVisit = useCallback((step: string, meta: EventData = {}) => {
    trackEvent('funnel_visit', { step, ...meta });
  }, []);

  const trackFunnelAction = useCallback((step: string, meta: EventData = {}) => {
    trackEvent('funnel_action', { step, ...meta });
  }, []);

  const trackFunnelSuccess = useCallback((step: string, meta: EventData = {}) => {
    trackEvent('funnel_success', { step, ...meta });
  }, []);

  return {
    trackEvent,
    trackPageView,
    identifyUser,
    trackFunnelVisit,
    trackFunnelAction,
    trackFunnelSuccess,
  };
};

// Window型を拡張してアナリティクスのグローバル変数を宣言
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
    mixpanel?: unknown;
    amplitude?: unknown;
  }
}

// ------------------------------
// Basic Web Vitals (CLS/LCP/FID) reporting without external deps
// ------------------------------
try {
  if (typeof window !== 'undefined') {
    let cumulativeLayoutShift = 0;
    let largestContentfulPaint = 0;
    let firstInputDelay = 0;

    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any) {
            const e = entry as any;
            if (!e.hadRecentInput) cumulativeLayoutShift += e.value || 0;
          }
        });
        // @ts-expect-error types for 'layout-shift'
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {}

      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1] as any;
          if (last && last.renderTime) {
            largestContentfulPaint = Math.max(largestContentfulPaint, last.renderTime);
          } else if (last && last.loadTime) {
            largestContentfulPaint = Math.max(largestContentfulPaint, last.loadTime);
          }
        });
        // @ts-expect-error types for 'largest-contentful-paint'
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {}

      try {
        const fidObserver = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0] as any;
          if (firstInput) {
            firstInputDelay = Math.max(0, firstInput.processingStart - firstInput.startTime);
          }
        });
        // @ts-expect-error types for 'first-input'
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch {}
    }

    const sendVitals = () => {
      try {
        const allowDev = (import.meta as any)?.env?.VITE_ENABLE_ANALYTICS === 'true';
        if (process.env.NODE_ENV !== 'production' && !allowDev) return;
        const clientId = getClientId();
        const sessionId = getSessionId();
        const path = typeof window !== 'undefined' ? window.location.pathname : undefined;
        postWithQueue('/api/analytics/track', {
          event: 'web_vitals',
          data: {
            cls: Number(cumulativeLayoutShift.toFixed(4)),
            lcp: Math.round(largestContentfulPaint),
            fid: Math.round(firstInputDelay),
            path,
            clientId,
            sessionId,
          },
          timestamp: new Date().toISOString(),
        });
      } catch {}
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendVitals();
    });
    window.addEventListener('pagehide', sendVitals);
  }
} catch {}
