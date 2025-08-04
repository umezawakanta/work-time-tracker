/**
 * 🔥 スモークテスト - システム基本動作確認
 * 
 * 最重要機能が正常に動作することを確認する
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';

// アプリケーションの基本動作確認
describe('🔥 Smoke Tests - システム基本動作', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  test('✅ React環境が正常に動作する', () => {
    const TestComponent = () => <div data-testid="test-component">Hello Test</div>;
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  test('✅ Redux Storeが正常に初期化される', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.getState().todo).toBeDefined();
  });

  test('✅ テストユーティリティが正常に動作する', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.createMockUser).toBeFunction();
    expect(global.testUtils.createMockTodo).toBeFunction();
    expect(global.testUtils.delay).toBeFunction();
  });

  test('✅ モックユーザーが正常に作成される', () => {
    const mockUser = global.testUtils.createMockUser();
    
    expect(mockUser).toEqual({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    });
  });

  test('✅ モックToDoが正常に作成される', () => {
    const mockTodo = global.testUtils.createMockTodo();
    
    expect(mockTodo).toEqual(expect.objectContaining({
      id: 'test-todo-id',
      name: 'Test Todo',
      completed: false,
      priority: 1,
      category: 'test'
    }));
  });

  test('✅ 環境変数が正しく設定されている', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.VITE_API_BASE_URL).toBe('http://localhost:3001/api');
  });

  test('✅ Axiosモックが正常に動作する', async () => {
    const axios = await import('axios');
    
    expect(axios.default.get).toBeDefined();
    expect(axios.default.post).toBeDefined();
    expect(axios.default.put).toBeDefined();
    expect(axios.default.delete).toBeDefined();
  });

  test('✅ ブラウザAPIモックが正常に動作する', () => {
    // LocalStorage
    expect(localStorage.setItem).toBeDefined();
    expect(localStorage.getItem).toBeDefined();
    
    // SessionStorage
    expect(sessionStorage.setItem).toBeDefined();
    expect(sessionStorage.getItem).toBeDefined();
    
    // Navigator
    expect(navigator.userAgent).toBeDefined();
    expect(navigator.clipboard).toBeDefined();
    
    // Window APIs
    expect(window.matchMedia).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
  });
});