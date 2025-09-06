import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Daily10TasksPage from '../Daily10TasksPage';
import { useAuth } from '@/hooks/useAuth';

// モック
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useDaily10Tasks');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDaily10Tasks = require('@/hooks/useDaily10Tasks')
  .useDaily10Tasks as jest.MockedFunction<any>;

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: false,
};

const mockTasks = [
  {
    id: 'task_1',
    name: '直近3ヶ月の収入と支出をすべて把握する',
    description: '収入・支出データの確認と最新状況の把握',
    category: 'financial' as const,
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_2',
    name: 'ギターの練習',
    description: '練習時間の記録と練習内容の記録',
    category: 'personal' as const,
    isActive: true,
    order: 7,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockProgress = {
  id: 'progress-123',
  userId: 'user-123',
  date: '2024-01-20',
  tasks: {
    task_1: {
      completed: true,
      completedAt: '2024-01-20T10:30:00Z',
      notes: '収入確認完了',
    },
    task_2: {
      completed: false,
      completedAt: undefined,
      notes: '',
    },
  },
  completionRate: 50,
  streak: 5,
  createdAt: '2024-01-20T00:00:00.000Z',
  updatedAt: '2024-01-20T00:00:00.000Z',
};

const mockStats = {
  totalDays: 30,
  completedDays: 25,
  averageCompletionRate: 85.5,
  longestStreak: 15,
  currentStreak: 5,
  weeklyStats: [
    {
      week: '2024-W01',
      completionRate: 80,
      completedTasks: 56,
    },
  ],
  monthlyStats: [
    {
      month: '2024-01',
      completionRate: 85,
      completedTasks: 255,
    },
  ],
};

const mockUpdateProgress = jest.fn();

describe('Daily10TasksPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    } as any);

    mockUseDaily10Tasks.mockReturnValue({
      tasks: mockTasks,
      progress: mockProgress,
      stats: mockStats,
      isLoading: false,
      error: null,
      updateProgress: mockUpdateProgress,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render the main page elements', () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('必ず毎日やる10のこと')).toBeInTheDocument();
    expect(screen.getByText('毎日の習慣を継続して、目標を達成しましょう')).toBeInTheDocument();
  });

  test('should display progress summary cards', () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('今日の進捗')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('50% 完了')).toBeInTheDocument();
    expect(screen.getByText('連続実行')).toBeInTheDocument();
    expect(screen.getByText('5日')).toBeInTheDocument();
  });

  test('should display task list', () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('直近3ヶ月の収入と支出をすべて把握する')).toBeInTheDocument();
    expect(screen.getByText('ギターの練習')).toBeInTheDocument();
  });

  test('should handle task completion toggle', async () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const secondCheckbox = checkboxes[1]; // ギターの練習のチェックボックス

    fireEvent.click(secondCheckbox);

    await waitFor(() => {
      expect(mockUpdateProgress).toHaveBeenCalledWith('task_2', true, '');
    });
  });

  test('should display loading state', () => {
    mockUseDaily10Tasks.mockReturnValue({
      tasks: [],
      progress: null,
      stats: null,
      isLoading: true,
      error: null,
      updateProgress: mockUpdateProgress,
    });

    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('should display error state', () => {
    mockUseDaily10Tasks.mockReturnValue({
      tasks: [],
      progress: null,
      stats: null,
      isLoading: false,
      error: 'データの読み込みに失敗しました',
      updateProgress: mockUpdateProgress,
    });

    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument();
  });

  test('should switch between tabs', () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    const statsTab = screen.getByText('統計');
    fireEvent.click(statsTab);

    expect(screen.getByText('週別完了率')).toBeInTheDocument();
    expect(screen.getByText('月別完了率')).toBeInTheDocument();
  });

  test('should display task notes functionality', () => {
    render(
      <BrowserRouter>
        <Daily10TasksPage />
      </BrowserRouter>
    );

    const memoButtons = screen.getAllByText('メモ');
    fireEvent.click(memoButtons[0]);

    expect(screen.getByPlaceholderText('メモを入力...')).toBeInTheDocument();
  });
});
