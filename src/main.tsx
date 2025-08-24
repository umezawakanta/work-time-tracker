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
    // @ts-ignore
    (window as any).React = React;
    // @ts-ignore
    (window as any).ReactDOM = ReactDOMClient;
    // バージョンの簡易ログ（本番ではコンソール除去設定で落ちます）
    // @ts-ignore
    console.log('[Boot] React version:', (React as any)?.version);
  }
} catch {}

// 🚫 ServiceWorker完全無効化（デバッグのため）
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations: ServiceWorkerRegistration[]) => {
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
