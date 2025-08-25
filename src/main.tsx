/// <reference lib="dom" />
import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './styles/global.css';
import './styles/accessibility.css';
import './styles/adaptive-ui.css';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling } from './lib/errorHandler';
import PerformanceOptimizer from './lib/performanceOptimizer';
// import { registerSW } from 'virtual:pwa-register';

// 🐛 エラーエリミネーター: グローバルエラーハンドリングの初期化
setupGlobalErrorHandling();

// ✅ 一部のUMD/外部ライブラリ対策: React/ReactDOM をグローバルに公開
try {
  if (typeof window !== 'undefined') {
    (window as any).React = React;
    (window as any).ReactDOM = ReactDOMClient;
    // バージョンの簡易ログ（本番ではコンソール除去設定で落ちます）
    console.log('[Boot] React version:', (React as any)?.version);
    // Runtime guard: ensure Children exists to prevent undefined assignment
    try {
      if (!(React as any)?.Children) {
        throw new Error('React.Children missing');
      }
    } catch (guardErr) {
      console.error('[Boot] React runtime guard failed:', guardErr);
      // Hard reload without cache as last resort
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('_r', Date.now().toString());
        window.location.replace(url.toString());
      } catch (_e) {
        console.debug('[Boot] reload fallback failed');
      }
    }
  }
} catch (e) {
  console.debug('[Boot] init guard error', e);
}

// 🚫 ServiceWorker完全無効化（デバッグのため）
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(function () {
          console.log('🗑️ ServiceWorker unregistered:', registration.scope);
        });
      }
    })
    .catch(() => {});
}

// 🥷 パフォーマンス忍者: パフォーマンス監視の初期化
const performanceOptimizer = PerformanceOptimizer.getInstance();
performanceOptimizer.startMetricsCollection();
performanceOptimizer.preloadCriticalResources();
performanceOptimizer.setupLazyLoading();

// PWAの自動更新を一時的に無効化（デバッグのため）
// registerSW({ onNeedRefresh() {}, onOfflineReady() {} });

// StrictModeは無限ループデバッグのため一時的に無効化
const enableStrictMode = false; // デバッグ後は true に戻す

ReactDOMClient.createRoot(document.getElementById('root')!).render(
  enableStrictMode ? (
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <Router>
            <App />
          </Router>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  ) : (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </ErrorBoundary>
  )
);
