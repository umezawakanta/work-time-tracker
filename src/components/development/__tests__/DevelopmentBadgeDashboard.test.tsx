import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DevelopmentBadgeDashboard } from '../DevelopmentBadgeDashboard';

// モック設定
jest.mock('../../../types/development-badges', () => ({
  DEVELOPMENT_BADGES: [
    {
      id: 'test-badge-1',
      name: '🚀 テストバッジ1',
      description: 'テスト用のバッジです',
      category: 'foundation',
      difficulty: 'bronze',
      icon: '🚀',
      requirements: [{ type: 'commit_count', target: 1, current: 1, description: '1回のコミット' }],
      isUnlocked: true,
      progress: 100,
    },
    {
      id: 'test-badge-2',
      name: '✅ テストバッジ2',
      description: '進行中のテストバッジ',
      category: 'features',
      difficulty: 'silver',
      icon: '✅',
      requirements: [
        {
          type: 'feature_complete',
          target: 'test_feature',
          current: 'in_progress',
          description: 'テスト機能完成',
        },
      ],
      isUnlocked: false,
      progress: 50,
    },
    {
      id: 'test-badge-3',
      name: '🎯 テストバッジ3',
      description: '未開始のテストバッジ',
      category: 'completion',
      difficulty: 'gold',
      icon: '🎯',
      requirements: [
        {
          type: 'performance_score',
          target: 90,
          current: 0,
          description: 'パフォーマンススコア90+',
        },
      ],
      isUnlocked: false,
      progress: 0,
    },
  ],
  BadgeCategory: ['foundation', 'features', 'completion'],
}));

describe('DevelopmentBadgeDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('コンポーネントが正しくレンダリングされる', () => {
    render(<DevelopmentBadgeDashboard />);

    expect(screen.getByText('🏆 開発バッジシステム')).toBeInTheDocument();
    expect(
      screen.getByText('サイト開発の進捗をバッジで可視化・ゲーミフィケーション')
    ).toBeInTheDocument();
    expect(screen.getByText('進捗を更新')).toBeInTheDocument();
  });

  it('全体進捗が正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 獲得済みバッジが1個（isUnlocked: true）、全体が3個なので33%
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 獲得済み数
    expect(screen.getByText('1')).toBeInTheDocument(); // 進行中（progress > 0 && !isUnlocked）
    expect(screen.getByText('1')).toBeInTheDocument(); // 未着手（progress === 0）
    expect(screen.getByText('3')).toBeInTheDocument(); // 総バッジ数
  });

  it('バッジカードが正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 各バッジのタイトルが表示されることを確認
    expect(screen.getByText('🚀 テストバッジ1')).toBeInTheDocument();
    expect(screen.getByText('✅ テストバッジ2')).toBeInTheDocument();
    expect(screen.getByText('🎯 テストバッジ3')).toBeInTheDocument();

    // 説明文も表示されることを確認
    expect(screen.getByText('テスト用のバッジです')).toBeInTheDocument();
    expect(screen.getByText('進行中のテストバッジ')).toBeInTheDocument();
    expect(screen.getByText('未開始のテストバッジ')).toBeInTheDocument();
  });

  it('達成済みバッジに成功マークが表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 達成済みバッジ（progress: 100）にはチェックマークが表示される
    const achievedBadgeCard = screen.getByText('🚀 テストバッジ1').closest('.relative');
    expect(achievedBadgeCard).toHaveClass('border-green-200', 'bg-green-50');
  });

  it('進捗バーが正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 各バッジの進捗率が表示される
    expect(screen.getByText('100%')).toBeInTheDocument(); // バッジ1
    expect(screen.getByText('50%')).toBeInTheDocument(); // バッジ2
    expect(screen.getByText('0%')).toBeInTheDocument(); // バッジ3
  });

  it('要件リストが正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 各バッジの要件説明が表示される
    expect(screen.getByText('1回のコミット')).toBeInTheDocument();
    expect(screen.getByText('テスト機能完成')).toBeInTheDocument();
    expect(screen.getByText('パフォーマンススコア90+')).toBeInTheDocument();
  });

  it('カテゴリフィルターが機能する', async () => {
    render(<DevelopmentBadgeDashboard />);

    // 初期状態では全てのバッジが表示される
    expect(screen.getByText('🚀 テストバッジ1')).toBeInTheDocument();
    expect(screen.getByText('✅ テストバッジ2')).toBeInTheDocument();
    expect(screen.getByText('🎯 テストバッジ3')).toBeInTheDocument();

    // 基盤カテゴリーをクリック
    fireEvent.click(screen.getByText('基盤'));

    // 基盤カテゴリーのバッジのみ表示される
    expect(screen.getByText('🚀 テストバッジ1')).toBeInTheDocument();
    expect(screen.queryByText('✅ テストバッジ2')).not.toBeInTheDocument();
    expect(screen.queryByText('🎯 テストバッジ3')).not.toBeInTheDocument();

    // 機能カテゴリーをクリック
    fireEvent.click(screen.getByText('機能'));

    // 機能カテゴリーのバッジのみ表示される
    expect(screen.queryByText('🚀 テストバッジ1')).not.toBeInTheDocument();
    expect(screen.getByText('✅ テストバッジ2')).toBeInTheDocument();
    expect(screen.queryByText('🎯 テストバッジ3')).not.toBeInTheDocument();

    // 全てタブに戻す
    fireEvent.click(screen.getByText('全て'));

    // 再度全てのバッジが表示される
    expect(screen.getByText('🚀 テストバッジ1')).toBeInTheDocument();
    expect(screen.getByText('✅ テストバッジ2')).toBeInTheDocument();
    expect(screen.getByText('🎯 テストバッジ3')).toBeInTheDocument();
  });

  it('進捗更新ボタンがクリックできる', async () => {
    // analyzeRepositoryProgressをモック
    const mockAnalyzeProgress = jest.fn().mockResolvedValue({
      commitCount: 200,
      featuresCompleted: ['test_feature'],
      testCoverage: 75,
      performanceScore: 85,
    });

    render(<DevelopmentBadgeDashboard />);

    const updateButton = screen.getByText('進捗を更新');
    expect(updateButton).toBeInTheDocument();

    fireEvent.click(updateButton);

    // ボタンがクリック可能であることを確認
    // （実際の更新処理はモック化されているため、エラーが発生しないことを確認）
    await waitFor(() => {
      expect(updateButton).toBeInTheDocument();
    });
  });

  it('難易度別の色分けが正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // bronze, silver, goldの各難易度のバッジが表示される
    expect(screen.getByText('bronze')).toBeInTheDocument();
    expect(screen.getByText('silver')).toBeInTheDocument();
    expect(screen.getByText('gold')).toBeInTheDocument();
  });

  it('要件の達成状況が正しく表示される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 達成済み要件（1/1）、進行中要件（in_progress）、未達成要件（0/90）
    expect(screen.getByText('1/1')).toBeInTheDocument();
    expect(screen.getByText('○')).toBeInTheDocument(); // 未完了の機能
    expect(screen.getByText('0/90')).toBeInTheDocument();
  });

  it('アクセシビリティ属性が適切に設定される', () => {
    render(<DevelopmentBadgeDashboard />);

    // 見出しにheadingロールが設定されている
    const mainHeading = screen.getByRole('heading', { name: /開発バッジシステム/ });
    expect(mainHeading).toBeInTheDocument();

    // タブリストが適切に設定されている
    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    // 各タブが適切に設定されている
    const allTab = screen.getByRole('tab', { name: '全て' });
    expect(allTab).toBeInTheDocument();
  });

  it('空のバッジリストでもエラーが発生しない', () => {
    // 空のバッジリストでテスト
    jest.doMock('@/types/development-badges', () => ({
      DEVELOPMENT_BADGES: [],
    }));

    const { container } = render(<DevelopmentBadgeDashboard />);

    // エラーが発生せずにレンダリングされることを確認
    expect(container).toBeInTheDocument();
    expect(screen.getByText('🏆 開発バッジシステム')).toBeInTheDocument();
  });

  it('長いバッジ名や説明が適切に表示される', () => {
    const longNameBadge = {
      id: 'long-badge',
      name: '🎨 非常に長いバッジ名をテストするためのサンプルバッジです',
      description:
        'これは非常に長い説明文をテストするためのものです。このような長い説明でもUIが崩れないことを確認する必要があります。',
      category: 'ui_ux' as const,
      difficulty: 'platinum' as const,
      icon: '🎨',
      requirements: [],
      isUnlocked: false,
      progress: 25,
    };

    // 一時的にバッジリストを変更
    jest.doMock('@/types/development-badges', () => ({
      DEVELOPMENT_BADGES: [longNameBadge],
    }));

    render(<DevelopmentBadgeDashboard />);

    // 長いテキストが表示されることを確認
    expect(screen.getByText(/非常に長いバッジ名をテスト/)).toBeInTheDocument();
    expect(screen.getByText(/これは非常に長い説明文をテスト/)).toBeInTheDocument();
  });
});
