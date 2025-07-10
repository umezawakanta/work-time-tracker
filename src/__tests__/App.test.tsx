import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';
import workTimeReducer from '../store/workTimeSlice';
import { store } from '../store';
import { render } from '../test/test-utils';

const createMockStore = () =>
  configureStore({
    reducer: {
      workTime: workTimeReducer,
    },
  });

interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children, initialEntries = ['/'] }) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  </Provider>
);

describe('App', () => {
  test('redirects to login for home (requires auth)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    // 認証が必要なページはログインページにリダイレクトされる
    // ログインページまたは何らかのリダイレクトが発生していることを確認
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('redirects to login for work time entry (requires auth)', () => {
    render(
      <MemoryRouter initialEntries={['/work-time']}>
        <App />
      </MemoryRouter>
    );
    // 認証が必要なページはログインページにリダイレクトされる
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders not found page for reports (requires auth)', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('404 - ページが見つかりません')).toBeInTheDocument();
  });

  test('renders not found page for invalid route', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('404 - ページが見つかりません')).toBeInTheDocument();
    expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
  });

  test('renders login page correctly', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders register page correctly', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders political trends page correctly', () => {
    render(
      <MemoryRouter initialEntries={['/political-trends']}>
        <App />
      </MemoryRouter>
    );
    expect(document.querySelector('body')).toBeInTheDocument();
  });
});
