import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';

// Create mock store reducers
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null }, action) => state,
      book: (state = { books: [], status: 'idle', error: null }, action) => state,
      user: (state = { hasActiveSubscription: false }, action) => state,
      todo: (state = { todos: [], status: 'idle', error: null }, action) => state,
      workTime: (
        state = {
          entries: [],
          currentEntry: null,
          isRunning: false,
          totalTime: 0,
          projects: [],
          categories: [],
          status: 'idle',
          error: null,
        },
        action
      ) => state,
      habit: (state = { habits: [], status: 'idle', error: null }, action) => state,
      assetQuest: (state = { badges: [], progress: {} }, action) => state,
      badge: (state = { badges: [], status: 'idle' }, action) => state,
      achievement: (state = { achievements: [], status: 'idle' }, action) => state,
      gamification: (state = { level: 1, experience: 0 }, action) => state,
      ...initialState,
    },
    preloadedState: initialState,
  });
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  initialState?: any;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const { initialState, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders initialState={initialState}>{children}</AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock auth hook
export const mockAuthValue = {
  isAuthenticated: true,
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  },
  setIsAuthenticated: jest.fn(),
  loading: false,
  setUser: jest.fn(),
  fetchUser: jest.fn(),
  updateProfile: jest.fn(),
  sessionExpired: false,
  refreshAuth: jest.fn(),
  sessionInfo: {
    isAuthenticated: true,
    expiresAt: new Date(Date.now() + 3600000),
    refreshExpiresAt: new Date(Date.now() + 86400000),
    timeUntilExpiry: 3600000,
    timeUntilRefreshExpiry: 86400000,
  },
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { createMockStore };
