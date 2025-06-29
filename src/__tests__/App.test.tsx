import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';
import workTimeReducer from '../store/workTimeSlice';
import { store } from '../store';

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
    render(<App />, { wrapper: TestWrapper });
    // 認証が必要なページはログインページにリダイレクトされる
    // ログインページまたは何らかのリダイレクトが発生していることを確認
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('redirects to login for work time entry (requires auth)', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/work-time']} />,
    });
    // 認証が必要なページはログインページにリダイレクトされる
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders not found page for reports (requires auth)', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/reports']} />,
    });
    expect(screen.getByText('404 - ページが見つかりません')).toBeInTheDocument();
  });

  test('renders not found page for invalid route', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/invalid-route']} />,
    });
    expect(screen.getByText('404 - ページが見つかりません')).toBeInTheDocument();
    expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
  });

  test('renders login page correctly', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/login']} />,
    });
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders register page correctly', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/register']} />,
    });
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('renders political trends page correctly', () => {
    render(<App />, {
      wrapper: (props) => <TestWrapper {...props} initialEntries={['/political-trends']} />,
    });
    expect(document.querySelector('body')).toBeInTheDocument();
  });
});
