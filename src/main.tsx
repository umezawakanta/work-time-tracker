import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import App from './App.tsx';
import './styles/global.css';
import './styles/accessibility.css';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling } from './lib/errorHandler';
// import { registerSW } from 'virtual:pwa-register';

// 🐛 エラーエリミネーター: グローバルエラーハンドリングの初期化
setupGlobalErrorHandling();

// PWAの自動更新を一時的に無効化（デバッグのため）
// registerSW({ onNeedRefresh() {}, onOfflineReady() {} });

// StrictModeは無限ループデバッグのため一時的に無効化
const enableStrictMode = false; // デバッグ後は true に戻す

ReactDOM.createRoot(document.getElementById('root')!).render(
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
