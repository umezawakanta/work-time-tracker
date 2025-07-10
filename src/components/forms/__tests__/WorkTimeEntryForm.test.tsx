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
jest.mock('@radix-ui/react-roving-focus', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('WorkTimeEntryForm', () => {
  beforeEach(() => {
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
  });

  test('renders WorkTimeEntryForm', async () => {
    render(<WorkTimeEntryForm />, {
      initialState: {
        workTime: {
          entries: [],
          isLoading: false,
          error: null,
          workState: null,
        },
      },
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('作業時間の記録')).toBeInTheDocument();
    expect(screen.getByText('プロジェクト名')).toBeInTheDocument();
    expect(screen.getByText('作業内容')).toBeInTheDocument();
    expect(screen.getByText('開始時間')).toBeInTheDocument();
    expect(screen.getByText('終了時間')).toBeInTheDocument();
  });
});

// Add more tests for form submission, validation, etc.
