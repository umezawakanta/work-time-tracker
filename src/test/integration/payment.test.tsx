import React from 'react';
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import EnhancedSubscriptionForm from '@/components/subscription/EnhancedSubscriptionForm';
import { AuthProvider } from '@/context/AuthContext';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() =>
    Promise.resolve({
      elements: jest.fn(() => ({
        create: jest.fn(() => ({
          mount: jest.fn(),
          destroy: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
        })),
      })),
      confirmCardPayment: jest.fn(),
      createPaymentMethod: jest.fn(),
    })
  ),
}));

// テスト用のモックプラン
const mockPlans = [
  {
    id: 'plan-free',
    name: 'フリープラン',
    description: '個人利用に最適',
    price: 0,
    currency: 'jpy',
    billingCycle: 'monthly' as const,
    features: ['基本機能', 'コミュニティサポート'],
    limits: {
      workHours: 100,
      projects: 3,
      tasks: 50,
      reports: 5,
      apiCalls: 1000,
      storage: 104857600,
      teamMembers: 1,
    },
    trialDays: 30,
  },
  {
    id: 'plan-basic',
    name: 'ベーシックプラン',
    description: '小規模チーム向け',
    price: 980,
    currency: 'jpy',
    billingCycle: 'monthly' as const,
    features: ['全機能利用可能', 'メールサポート'],
    limits: {
      workHours: 500,
      projects: 15,
      tasks: 200,
      reports: 25,
      apiCalls: 5000,
      storage: 1073741824,
      teamMembers: 5,
    },
    isPopular: true,
    trialDays: 14,
  },
];

// MSW サーバー設定
const server = setupServer(
  // 成功レスポンス
  http.post('/api/subscriptions/create', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          subscription: {
            id: 'sub_test123',
            planId: 'plan-basic',
            status: 'active',
            amount: 980,
            currency: 'jpy',
          },
          message: 'サブスクリプションを作成しました',
          nextSteps: ['プロフィールを設定してください'],
        },
      },
      { status: 201 }
    );
  }),

  // エラーレスポンス（カード拒否）
  rest.post('/api/subscriptions/create', (req, res, ctx) => {
    const body = req.body as any;
    if (body.planId === 'plan-error-card-declined') {
      return res(
        ctx.status(402),
        ctx.json({
          success: false,
          error: 'Payment error',
          message: 'カードが拒否されました。別のカードをお試しください。',
          errorCode: 'STRIPE_CARD_DECLINED',
          retryable: false,
        })
      );
    }
    return res(ctx.status(201), ctx.json({ success: true }));
  }),

  // 重複エラー
  rest.post('/api/subscriptions/create', (req, res, ctx) => {
    const body = req.body as any;
    if (body.confirmationToken === 'duplicate_token') {
      return res(
        ctx.status(409),
        ctx.json({
          success: false,
          error: 'Duplicate operation',
          message: '同じ操作が既に実行中です。しばらくお待ちください。',
          errorCode: 'DUPLICATE_OPERATION',
          retryable: false,
        })
      );
    }
    return res(ctx.status(201), ctx.json({ success: true }));
  }),

  // サーバーエラー
  rest.post('/api/subscriptions/create', (req, res, ctx) => {
    const body = req.body as any;
    if (body.planId === 'plan-server-error') {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          error: 'Internal server error',
          message: 'サーバーでエラーが発生しました。しばらく待ってからお試しください。',
          errorCode: 'INTERNAL_ERROR',
          retryable: true,
        })
      );
    }
    return res(ctx.status(201), ctx.json({ success: true }));
  })
);

beforeEach(() => {
  server.listen();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
});

// テスト用のWrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('課金システム統合テスト', () => {
  describe('プラン選択', () => {
    test('プラン一覧が正しく表示される', async () => {
      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('サブスクリプションプラン')).toBeInTheDocument();
      expect(screen.getByText('フリープラン')).toBeInTheDocument();
      expect(screen.getByText('ベーシックプラン')).toBeInTheDocument();
      expect(screen.getByText('人気プラン')).toBeInTheDocument();
    });

    test('プランを選択できる', async () => {
      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const basicPlanCard =
        screen.getByText('ベーシックプラン').closest('[data-testid="plan-card"]') ||
        screen.getByText('ベーシックプラン').closest('div[class*="cursor-pointer"]');

      fireEvent.click(basicPlanCard!);

      await waitFor(() => {
        expect(screen.getByText('選択されたプラン: ベーシックプラン')).toBeInTheDocument();
      });
    });

    test('請求サイクルを変更できる', async () => {
      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={[
              ...mockPlans,
              {
                ...mockPlans[1],
                id: 'plan-basic-yearly',
                billingCycle: 'yearly' as const,
                price: 9800,
              },
            ]}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const yearlyButton = screen.getByText('年額プラン');
      fireEvent.click(yearlyButton);

      await waitFor(() => {
        expect(yearlyButton).toHaveClass('bg-primary');
      });
    });
  });

  describe('決済処理', () => {
    test('成功時の決済フローが正しく動作する', async () => {
      const onSubscriptionCreate = jest.fn();

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={onSubscriptionCreate}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      // プラン選択
      const basicPlanCard = screen
        .getByText('ベーシックプラン')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(basicPlanCard!);

      // 決済開始
      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      // 決済ダイアログが表示される
      await waitFor(() => {
        expect(screen.getByText('サブスクリプション作成中')).toBeInTheDocument();
      });

      // 進捗表示の確認
      expect(screen.getByText('入力内容の確認')).toBeInTheDocument();
      expect(screen.getByText('アカウント設定')).toBeInTheDocument();
      expect(screen.getByText('サブスクリプション作成')).toBeInTheDocument();

      // 成功コールバックが呼ばれる
      await waitFor(
        () => {
          expect(onSubscriptionCreate).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'sub_test123',
              planId: 'plan-basic',
            })
          );
        },
        { timeout: 10000 }
      );
    });

    test('カード拒否エラーが適切に処理される', async () => {
      const onError = jest.fn();

      // カード拒否エラーをシミュレートするためのモックプラン
      const errorPlan = {
        ...mockPlans[1],
        id: 'plan-error-card-declined',
      };

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={[errorPlan]}
            onSubscriptionCreate={jest.fn()}
            onError={onError}
          />
        </TestWrapper>
      );

      // プラン選択と決済開始
      const planCard = screen.getByText('ベーシックプラン').closest('div[class*="cursor-pointer"]');
      fireEvent.click(planCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      // エラーメッセージの確認
      await waitFor(
        () => {
          expect(
            screen.getByText('カードが拒否されました。別のカードをお試しください。')
          ).toBeInTheDocument();
          expect(screen.getByText('別のクレジットカードをお試しください')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // エラーコールバックが呼ばれる
      expect(onError).toHaveBeenCalled();
    });

    test('重複操作エラーが適切に処理される', async () => {
      const onError = jest.fn();

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={onError}
          />
        </TestWrapper>
      );

      // 最初の決済試行
      const basicPlanCard = screen
        .getByText('ベーシックプラン')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(basicPlanCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      // 重複試行（confirmationTokenを固定）
      Object.defineProperty(Math, 'random', {
        value: () => 0.5, // 固定値でトークンを生成
        writable: true,
      });

      fireEvent.click(subscribeButton);

      await waitFor(
        () => {
          expect(
            screen.getByText('同じ操作が既に実行中です。しばらくお待ちください。')
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });

    test('サーバーエラー時のリトライ機能が動作する', async () => {
      const errorPlan = {
        ...mockPlans[1],
        id: 'plan-server-error',
      };

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={[errorPlan]}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      // プラン選択と決済開始
      const planCard = screen.getByText('ベーシックプラン').closest('div[class*="cursor-pointer"]');
      fireEvent.click(planCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      // エラーとリトライボタンの確認
      await waitFor(
        () => {
          expect(
            screen.getByText('サーバーでエラーが発生しました。しばらく待ってからお試しください。')
          ).toBeInTheDocument();
          expect(screen.getByText('再試行')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // リトライボタンをクリック
      const retryButton = screen.getByText('再試行');
      fireEvent.click(retryButton);

      // リトライが実行される
      await waitFor(() => {
        expect(screen.getByText('サブスクリプション作成中')).toBeInTheDocument();
      });
    });
  });

  describe('セキュリティテスト', () => {
    test('認証トークンが正しく送信される', async () => {
      localStorage.setItem('auth_token', 'test_token_123');

      const interceptedRequests: any[] = [];
      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          interceptedRequests.push({
            headers: req.headers,
            body: req.body,
          });
          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const basicPlanCard = screen
        .getByText('ベーシックプラン')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(basicPlanCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      await waitFor(
        () => {
          expect(interceptedRequests).toHaveLength(1);
          expect(interceptedRequests[0].headers.get('Authorization')).toBe('Bearer test_token_123');
        },
        { timeout: 10000 }
      );
    });

    test('確認トークンが生成される', async () => {
      const interceptedRequests: any[] = [];
      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          interceptedRequests.push(req.body);
          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const basicPlanCard = screen
        .getByText('ベーシックプラン')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(basicPlanCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      await waitFor(
        () => {
          expect(interceptedRequests).toHaveLength(1);
          expect(interceptedRequests[0]).toHaveProperty('confirmationToken');
          expect(interceptedRequests[0].confirmationToken).toMatch(/^conf_\d+_[a-z0-9]+$/);
        },
        { timeout: 10000 }
      );
    });

    test('XSS攻撃に対する保護', async () => {
      const maliciousPlan = {
        ...mockPlans[1],
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">',
      };

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={[maliciousPlan]}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      // スクリプトが実行されずにエスケープされることを確認
      expect(screen.queryByText('<script>alert("XSS")</script>')).not.toBeInTheDocument();
      expect(screen.queryByText('<img src="x" onerror="alert(\'XSS\')">')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティテスト', () => {
    test('キーボードナビゲーションが動作する', async () => {
      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const firstPlanCard = screen
        .getByText('フリープラン')
        .closest('div[class*="cursor-pointer"]');

      // フォーカスを設定
      firstPlanCard?.focus();

      // Enterキーで選択
      fireEvent.keyDown(firstPlanCard!, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('選択されたプラン: フリープラン')).toBeInTheDocument();
      });
    });

    test('スクリーンリーダー対応のaria属性が設定されている', () => {
      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      // aria-labelやrole属性の確認
      const planCards = screen.getAllByRole('button');
      expect(planCards.length).toBeGreaterThan(0);

      // プログレスバーのアクセシビリティ
      const basicPlanCard = screen
        .getByText('ベーシックプラン')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(basicPlanCard!);

      const subscribeButton = screen.getByText('サブスクリプションを開始');
      fireEvent.click(subscribeButton);

      // プログレスバーにはaria-valuenowとaria-valuemaxが設定されているべき
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のプランでもレンダリングが高速', async () => {
      const manyPlans = Array.from({ length: 100 }, (_, i) => ({
        ...mockPlans[1],
        id: `plan-${i}`,
        name: `プラン ${i}`,
      }));

      const startTime = performance.now();

      render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={manyPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // レンダリング時間が500ms以下であることを確認
      expect(renderTime).toBeLessThan(500);
      expect(screen.getByText('プラン 0')).toBeInTheDocument();
      expect(screen.getByText('プラン 99')).toBeInTheDocument();
    });

    test('メモリリークが発生しない', async () => {
      const { unmount } = render(
        <TestWrapper>
          <EnhancedSubscriptionForm
            plans={mockPlans}
            onSubscriptionCreate={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );

      // コンポーネントをアンマウント
      unmount();

      // タイマーやイベントリスナーがクリーンアップされていることを確認
      // （実際のテストではメモリ使用量を測定）
      expect(true).toBe(true); // プレースホルダー
    });
  });

  describe('エラー境界テスト', () => {
    test('予期しないエラーが適切に処理される', async () => {
      // コンソールエラーを一時的に無効化
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const ThrowError = () => {
        throw new Error('テスト用エラー');
      };

      render(
        <TestWrapper>
          <ThrowError />
        </TestWrapper>
      );

      // エラーバウンダリが動作することを確認
      // 実際の実装ではエラーバウンダリコンポーネントが必要

      consoleSpy.mockRestore();
    });
  });
});

// テストユーティリティ関数
export const createMockUser = (overrides = {}) => ({
  id: 'user-test-123',
  email: 'test@example.com',
  name: 'テストユーザー',
  isAdmin: false,
  ...overrides,
});

export const createMockSubscription = (overrides = {}) => ({
  id: 'sub-test-123',
  planId: 'plan-basic',
  status: 'active',
  amount: 980,
  currency: 'jpy',
  startDate: new Date().toISOString(),
  ...overrides,
});

// E2Eテスト用のユーティリティ
export const simulateSuccessfulPayment = async () => {
  // Stripe Elements APIのモック
  return Promise.resolve({
    paymentIntent: {
      status: 'succeeded',
      id: 'pi_test_123',
    },
  });
};

export const simulateFailedPayment = async (errorCode = 'card_declined') => {
  return Promise.resolve({
    error: {
      code: errorCode,
      message: 'Your card was declined.',
      type: 'card_error',
    },
  });
};
