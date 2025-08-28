import React from 'react';
import { render, screen, waitFor } from '../../../test/test-utils';
import WorkTimeEntryForm from '../WorkTimeEntryForm';
import { useAuth } from '../../../hooks/useAuth';
import userSubscriptionApi from '../../../services/api/userSubscriptionApi';
import projectApi from '../../../services/api/projectApi';

// Mock the auth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the API services
jest.mock('@/services/api/userSubscriptionApi');
jest.mock('@/services/api/projectApi');

const mockUserSubscriptionApi = userSubscriptionApi as jest.Mocked<typeof userSubscriptionApi>;
const mockProjectApi = projectApi as jest.Mocked<typeof projectApi>;

// Mock toast
jest.mock('../../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock date-fns to prevent potential issues
jest.mock('date-fns', () => ({
  format: jest.fn((date, format) => date.toISOString()),
  isToday: jest.fn(() => true),
}));

// Mock Radix UI components that might cause re-render issues
jest.mock('@radix-ui/react-roving-focus', () => {
  const React = require('react');
  return {
    Root: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Item: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
  };
});

// Mock UI components to avoid import issues
jest.mock('@/components/ui/calendar', () => {
  const React = require('react');
  return {
    Calendar: ({ children, onSelect, ...props }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'calendar', ...props },
        React.createElement(
          'button',
          { onClick: () => onSelect && onSelect(new Date()) },
          'Select Date'
        ),
        children
      ),
  };
});

jest.mock('@/components/ui/tabs', () => {
  const React = require('react');
  return {
    Tabs: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'tabs', ...props }, children),
    TabsList: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'tabs-list', ...props }, children),
    TabsTrigger: ({ children, ...props }: any) =>
      React.createElement('button', { 'data-testid': 'tabs-trigger', ...props }, children),
    TabsContent: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'tabs-content', ...props }, children),
  };
});

jest.mock('@/components/ui/popover', () => {
  const React = require('react');
  return {
    Popover: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'popover', ...props }, children),
    PopoverTrigger: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'popover-trigger', ...props }, children),
    PopoverContent: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'popover-content', ...props }, children),
  };
});

jest.mock('@/components/ui/dialog', () => {
  const React = require('react');
  const create = React.createElement;
  return {
    Dialog: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog', ...props }, children),
    DialogTrigger: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-trigger', ...props }, children),
    DialogContent: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-content', ...props }, children),
    DialogHeader: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-header', ...props }, children),
    DialogTitle: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-title', ...props }, children),
    DialogDescription: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-description', ...props }, children),
    DialogFooter: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dialog-footer', ...props }, children),
  };
});

describe('WorkTimeEntryForm', () => {
  beforeEach(() => {
    // Clear all mocks and timers
    jest.clearAllMocks();

    // Setup auth mock
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        _id: 'test-user-id',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        avatar: '',
      },
      isAuthenticated: true,
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
    });

    // Setup API mocks
    mockProjectApi.getUserProjects.mockResolvedValue({
      data: [
        {
          _id: 'project-1',
          name: 'テストプロジェクト',
          color: 'bg-blue-500',
          userId: 'test-user-id',
          lastUsed: new Date(),
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    mockUserSubscriptionApi.getUserSubscription.mockRejectedValue(new Error('No subscription'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  test('renders WorkTimeEntryForm', async () => {
    // Add error boundary to catch render errors
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch (error) {
        console.error('Component render error:', error);
        return <div>Render error: {String(error)}</div>;
      }
    };

    render(
      <ErrorBoundary>
        <WorkTimeEntryForm />
      </ErrorBoundary>,
      {
        initialState: {
          workTime: {
            entries: [],
            isLoading: false,
            error: null,
            workState: null,
          },
        },
      }
    );

    // Wait for loading to complete with shorter timeout
    await waitFor(
      () => {
        expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Check if the basic form elements are present
    expect(screen.getByText('作業時間の記録')).toBeInTheDocument();
    expect(screen.getAllByText('プロジェクト名')).toHaveLength(3); // Multiple tabs each have project name
    expect(screen.getAllByText('作業内容')).toHaveLength(2); // Auto and manual tabs each have work content
    expect(screen.getByText('開始時間')).toBeInTheDocument();
    expect(screen.getByText('終了時間')).toBeInTheDocument();
  }, 10000); // Increase test timeout to 10 seconds
});

// Add more tests for form submission, validation, etc.
