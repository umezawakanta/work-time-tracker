/**
 * 🧪 カスタムレンダーヘルパー
 * React Testing Libraryのrenderをプロバイダー付きで拡張
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { TestProviders, MockAuthProvider } from './TestProviders';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  isAuthenticated?: boolean;
  user?: any;
  isAdmin?: boolean;
  useMockAuth?: boolean;
}

/**
 * プロバイダー付きカスタムレンダー関数
 */
function customRender(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    isAuthenticated = true,
    user = null,
    isAdmin = false,
    useMockAuth = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Always render into an explicit container to avoid createRoot target errors
  const container = document.createElement('div');
  document.body.appendChild(container);

  // モックAuthを使用する場合
  if (useMockAuth) {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MockAuthProvider isAuthenticated={isAuthenticated} user={user} isAdmin={isAdmin}>
        {children}
      </MockAuthProvider>
    );
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions, container });
  }

  // 通常のTestProvidersを使用
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders initialEntries={initialEntries}>{children}</TestProviders>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions, container });
}

/**
 * 認証が必要なコンポーネント用のレンダー関数
 */
export function renderWithAuth(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    useMockAuth: true,
    isAuthenticated: true,
    isAdmin: false,
    ...options,
  });
}

/**
 * 管理者権限が必要なコンポーネント用のレンダー関数
 */
export function renderWithAdminAuth(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    useMockAuth: true,
    isAuthenticated: true,
    isAdmin: true,
    ...options,
  });
}

/**
 * 認証なしでのレンダー関数
 */
export function renderWithoutAuth(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    useMockAuth: true,
    isAuthenticated: false,
    ...options,
  });
}

// デフォルトのrenderをカスタムrenderに置き換え
export { customRender as render };

// React Testing Libraryの他のエクスポートを再エクスポート
export * from '@testing-library/react';
