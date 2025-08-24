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

async function flushAnalyticsQueue(): Promise<void> {
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
 * アナリティクス機能を提供するカスタムフック
 * ユーザーの行動を追跡し、分析に役立てるための機能を提供します
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

  /**
   * Google Analyticsのスクリプトを動的にロードする関数
   */
  const loadGoogleAnalytics = () => {
    const gtagId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!gtagId) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gtagId}', { send_page_view: true });
    `;
    document.head.appendChild(script2);
  };

  /**
   * Mixpanelのスクリプトを動的にロードする関数
   */
  const loadMixpanel = () => {
    const mixpanelId = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (!mixpanelId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
      for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
      mixpanel.init("${mixpanelId}");
    `;
    document.head.appendChild(script);
  };

  /**
   * Amplitudeのスクリプトを動的にロードする関数
   */
  const loadAmplitude = () => {
    const amplitudeKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!amplitudeKey) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.amplitude.com/libs/amplitude-8.5.0-min.js';
    script.onload = function () {
      if (window.amplitude) {
        (window.amplitude as any).getInstance().init(amplitudeKey);
      }
    };
    document.head.appendChild(script);
  };

  /**
   * イベントを追跡する関数
   * @param eventName イベント名
   * @param data イベントデータ
   */
  const trackEvent = useCallback((eventName: string, data: EventData = {}) => {
    // 初回アクティベーション統一イベント（dev/prod共通）
    try {
      const qualifies =
        eventName === 'assessment_saved' ||
        eventName === 'learning_progress_saved' ||
        (eventName === 'ai_assistant_reply' && Boolean((data as any).ok));

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
      console.log(`[Analytics] Event: ${eventName}`, data);
      // dev時もリモート送信が有効ならPOST
      try {
        if (import.meta?.env?.VITE_ENABLE_ANALYTICS === 'true') {
          const clientId = getClientId();
          const sessionId = getSessionId();
          postWithQueue('/api/analytics/track', {
            event: eventName,
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
        window.gtag('event', eventName, data);
      }

      // Mixpanel
      if (window.mixpanel) {
        (window.mixpanel as any).track(eventName, data);
      }

      // Amplitude
      if (window.amplitude) {
        (window.amplitude as any).getInstance().logEvent(eventName, data);
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
          event: eventName,
          data: { ...data, clientId, sessionId },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }, []);

  // ファネル用ショートカット
  const trackFunnelVisit = useCallback(
    (step: string, meta: EventData = {}) => {
      trackEvent('funnel_visit', { step, ...meta });
    },
    [trackEvent]
  );

  const trackFunnelAction = useCallback(
    (step: string, meta: EventData = {}) => {
      trackEvent('funnel_action', { step, ...meta });
    },
    [trackEvent]
  );

  const trackFunnelSuccess = useCallback(
    (step: string, meta: EventData = {}) => {
      trackEvent('funnel_success', { step, ...meta });
    },
    [trackEvent]
  );

  /**
   * ページビューを追跡する関数
   * @param pagePath ページパス
   * @param pageTitle ページタイトル
   */
  const trackPageView = useCallback((pagePath: string, pageTitle?: string) => {
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
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
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
  }, []);

  /**
   * ユーザー特性を設定する関数
   * @param userId ユーザーID
   * @param traits ユーザー特性
   */
  const identifyUser = useCallback((userId: string, traits: Record<string, any> = {}) => {
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
