/**
 * 📊 アナリティクスダッシュボードテスト
 * 
 * ユーザー解析ダッシュボードコンポーネントの表示・機能テスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { userTrackingService, UserAnalytics } from '@/services/analytics/UserTrackingService';

// userTrackingServiceをモック
jest.mock('@/services/analytics/UserTrackingService', () => ({
  userTrackingService: {
    getAnalytics: jest.fn(),
  },
}));

// react-hot-toastをモック
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// rechartsをモック（チャートライブラリ）
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockAnalytics: UserAnalytics = {
  totalUsers: 1247,
  activeUsers: 89,
  newUsers: 23,
  returningUsers: 66,
  averageSessionDuration: 847,
  pageViewsTotal: 3421,
  topPages: [
    { page: '/dashboard', views: 892 },
    { page: '/todo-manager', views: 743 },
    { page: '/quadrant-dashboard', views: 651 },
  ],
  deviceBreakdown: {
    desktop: 67,
    mobile: 28,
    tablet: 5,
  },
  trafficSources: {
    direct: 45,
    search: 32,
    social: 15,
    referral: 8,
  },
  userJourney: [
    {
      page: '/dashboard',
      averageTimeSpent: 234,
      exitRate: 12,
      nextPages: [
        { page: '/todo-manager', percentage: 43 },
        { page: '/quadrant-dashboard', percentage: 28 },
      ],
    },
  ],
};

describe('📊 AnalyticsDashboard コンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userTrackingService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);
  });

  describe('✅ 基本表示機能', () => {
    test('管理者ユーザーにダッシュボードが表示される', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      expect(screen.getByText('リアルタイムユーザー行動とサイト解析')).toBeInTheDocument();
    });

    test('非管理者ユーザーにアクセス拒否メッセージが表示される', () => {
      render(<AnalyticsDashboard isAdminUser={false} />);

      expect(screen.getByText('管理者権限が必要です')).toBeInTheDocument();
      expect(screen.getByText('このダッシュボードは管理者のみアクセスできます。')).toBeInTheDocument();
    });

    test('ローディング状態が正しく表示される', () => {
      (userTrackingService.getAnalytics as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // 未解決のPromise
      );

      render(<AnalyticsDashboard isAdminUser={true} />);

      expect(screen.getByText('解析データを読み込み中...')).toBeInTheDocument();
    });
  });

  describe('📈 メトリクス表示', () => {
    test('概要メトリクスが正しく表示される', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('1,247')).toBeInTheDocument(); // totalUsers
        expect(screen.getByText('89')).toBeInTheDocument(); // activeUsers
        expect(screen.getByText('14m 7s')).toBeInTheDocument(); // averageSessionDuration
        expect(screen.getByText('3,421')).toBeInTheDocument(); // pageViewsTotal
      });
    });

    test('成長率指標が表示される', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getAllByText('+12.5%')).toHaveLength(1);
        expect(screen.getAllByText('+8.3%')).toHaveLength(1);
        expect(screen.getAllByText('+5.2%')).toHaveLength(1);
        expect(screen.getAllByText('+15.7%')).toHaveLength(1);
      });
    });

    test('人気ページが正しく表示される', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('/dashboard')).toBeInTheDocument();
        expect(screen.getByText('/todo-manager')).toBeInTheDocument();
        expect(screen.getByText('/quadrant-dashboard')).toBeInTheDocument();
        expect(screen.getByText('892')).toBeInTheDocument();
        expect(screen.getByText('743')).toBeInTheDocument();
        expect(screen.getByText('651')).toBeInTheDocument();
      });
    });
  });

  describe('🔄 データ更新機能', () => {
    test('更新ボタンクリックでデータが再読み込みされる', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /更新/i });
      await user.click(refreshButton);

      expect(userTrackingService.getAnalytics).toHaveBeenCalledTimes(2);
    });

    test('時間範囲変更でデータが更新される', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // 時間範囲セレクターを操作
      const timeRangeSelect = screen.getByRole('combobox');
      await user.click(timeRangeSelect);

      const monthOption = screen.getByRole('option', { name: '過去30日' });
      await user.click(monthOption);

      expect(userTrackingService.getAnalytics).toHaveBeenLastCalledWith('month');
    });
  });

  describe('📊 タブ機能', () => {
    test('タブ切り替えが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // デバイスタブに切り替え
      const devicesTab = screen.getByRole('tab', { name: 'デバイス' });
      await user.click(devicesTab);

      expect(screen.getByText('デバイス別アクセス')).toBeInTheDocument();

      // トラフィックタブに切り替え
      const trafficTab = screen.getByRole('tab', { name: 'トラフィック' });
      await user.click(trafficTab);

      expect(screen.getByText('トラフィックソース')).toBeInTheDocument();
    });

    test('ページ解析タブでチャートが表示される', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      const pagesTab = screen.getByRole('tab', { name: 'ページ解析' });
      await user.click(pagesTab);

      expect(screen.getByText('ページ別詳細解析')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('📤 エクスポート機能', () => {
    test('エクスポートボタンでデータダウンロードが実行される', async () => {
      const user = userEvent.setup();
      
      // createObjectURLとrevokeObjectURLをモック
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      const mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // a要素のclickをモック
      const mockClick = jest.fn();
      const mockLink = { click: mockClick, href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /エクスポート/i });
      await user.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('📱 レスポンシブ表示', () => {
    test('デバイス情報が適切に表示される', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // デバイス別データが表示されることを確認
      const user = userEvent.setup();
      const devicesTab = screen.getByRole('tab', { name: 'デバイス' });
      await user.click(devicesTab);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('28%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });
  });

  describe('⚠️ エラーハンドリング', () => {
    test('データ取得失敗時にエラー処理される', async () => {
      (userTrackingService.getAnalytics as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );

      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('データが見つかりません')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: '再読み込み' });
      expect(retryButton).toBeInTheDocument();
    });

    test('ネットワークエラー時に適切なメッセージが表示される', async () => {
      (userTrackingService.getAnalytics as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { toast } = await import('react-hot-toast');
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('解析データの読み込みに失敗しました');
      });
    });

    test('空のデータセットが適切に処理される', async () => {
      const emptyAnalytics: UserAnalytics = {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        averageSessionDuration: 0,
        pageViewsTotal: 0,
        topPages: [],
        deviceBreakdown: {},
        trafficSources: {},
        userJourney: [],
      };

      (userTrackingService.getAnalytics as jest.Mock).mockResolvedValueOnce(emptyAnalytics);

      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });

  describe('🎨 チャート表示', () => {
    test('パイチャートが正しく表示される', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // デバイスタブでパイチャート確認
      const devicesTab = screen.getByRole('tab', { name: 'デバイス' });
      await user.click(devicesTab);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    test('棒グラフが正しく表示される', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // ページ解析タブで棒グラフ確認
      const pagesTab = screen.getByRole('tab', { name: 'ページ解析' });
      await user.click(pagesTab);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('🔍 データフィルタリング', () => {
    test('時間範囲フィルターが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // デフォルトで過去7日が選択されている
      expect(userTrackingService.getAnalytics).toHaveBeenCalledWith('week');

      // 今日に変更
      const timeRangeSelect = screen.getByRole('combobox');
      await user.click(timeRangeSelect);

      const todayOption = screen.getByRole('option', { name: '今日' });
      await user.click(todayOption);

      expect(userTrackingService.getAnalytics).toHaveBeenCalledWith('day');
    });
  });

  describe('♿ アクセシビリティ', () => {
    test('適切なARIA属性が設定されている', async () => {
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // タブリストのアクセシビリティ
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      // ボタンのアクセシビリティ
      const refreshButton = screen.getByRole('button', { name: /更新/i });
      expect(refreshButton).toBeInTheDocument();

      const exportButton = screen.getByRole('button', { name: /エクスポート/i });
      expect(exportButton).toBeInTheDocument();
    });

    test('キーボードナビゲーションが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard isAdminUser={true} />);

      await waitFor(() => {
        expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
      });

      // Tabキーでフォーカス移動
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /エクスポート/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /更新/i })).toHaveFocus();
    });
  });
});

describe('📊 AnalyticsDashboard 統合テスト', () => {
  test('完全なダッシュボード操作フローが正常に動作する', async () => {
    const user = userEvent.setup();
    (userTrackingService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);

    render(<AnalyticsDashboard isAdminUser={true} />);

    // 1. 初期読み込み
    await waitFor(() => {
      expect(screen.getByText('📊 ユーザー解析ダッシュボード')).toBeInTheDocument();
    });

    // 2. メトリクス確認
    expect(screen.getByText('1,247')).toBeInTheDocument();

    // 3. タブ切り替え
    const devicesTab = screen.getByRole('tab', { name: 'デバイス' });
    await user.click(devicesTab);
    expect(screen.getByText('デバイス別アクセス')).toBeInTheDocument();

    // 4. 時間範囲変更
    const timeRangeSelect = screen.getByRole('combobox');
    await user.click(timeRangeSelect);
    const monthOption = screen.getByRole('option', { name: '過去30日' });
    await user.click(monthOption);

    // 5. データ更新確認
    expect(userTrackingService.getAnalytics).toHaveBeenCalledWith('month');

    // 6. エクスポート機能
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    jest.spyOn(document, 'createElement').mockReturnValue({ click: jest.fn() } as any);

    const exportButton = screen.getByRole('button', { name: /エクスポート/i });
    await user.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});