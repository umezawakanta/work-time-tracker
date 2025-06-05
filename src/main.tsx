import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './styles/global.css';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // 開発環境でのみStrictModeを有効にする
  process.env.NODE_ENV === 'development' ? (
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
