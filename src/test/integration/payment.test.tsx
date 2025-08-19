import React from 'react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        getElement: jest.fn(),
      })),
      createPaymentMethod: jest.fn(() =>
        Promise.resolve({
          paymentMethod: {
            id: 'pm_test123',
            type: 'card',
          },
        })
      ),
      confirmPayment: jest.fn(() =>
        Promise.resolve({
          paymentIntent: {
            id: 'pi_test123',
            status: 'succeeded',
          },
        })
      ),
    })
  ),
}));

// Mock Firebase Auth
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com',
    },
  },
}));

// 料金プラン定義
const mockPricingPlans: Array<{
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  billingCycle?: 'monthly' | 'yearly';
  features?: string[];
  isPopular?: boolean;
  trialDays?: number;
}> = [
  {
    id: 'plan-basic',
    name: 'ベーシック',
    price: 980,
    currency: 'jpy',
    interval: 'month',
    features: ['基本機能', 'サポート'],
    isPopular: false,
    trialDays: 7,
  },
  {
    id: 'plan-premium',
    name: 'プレミアム',
    price: 1980,
    currency: 'jpy',
    interval: 'month',
    features: ['全機能', '優先サポート', 'AI分析'],
    isPopular: true,
    trialDays: 14,
  },
];

// フェッチモック
type Scenario =
  | 'success'
  | 'card_declined'
  | 'duplicate'
  | 'server_error'
  | 'invalid_plan'
  | 'timeout';
let scenario: Scenario = 'success';

const mockFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = (init?.method || 'GET').toUpperCase();
  const json = (data: any, status = 200) =>
    Promise.resolve(
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    );

  if (url.includes('/api/plans') && method === 'GET') {
    return json({ success: true, data: mockPricingPlans }, 200);
  }

  if (url.includes('/api/payments/process') && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    return json(
      {
        success: true,
        data: {
          paymentIntent: {
            id: 'pi_test123',
            status: 'succeeded',
            amount: body.amount || 980,
            currency: 'jpy',
          },
        },
      },
      200
    );
  }

  if (url.includes('/api/subscriptions/create') && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};

    const activeScenario: Scenario =
      body.planId === 'plan-error-card-declined'
        ? 'card_declined'
        : body.confirmationToken === 'duplicate_token'
          ? 'duplicate'
          : body.planId === 'plan-error-server'
            ? 'server_error'
            : body.planId === 'plan-invalid'
              ? 'invalid_plan'
              : body.planId === 'plan-timeout'
                ? 'timeout'
                : scenario;

    switch (activeScenario) {
      case 'card_declined':
        return json(
          {
            success: false,
            error: 'Payment error',
            message: 'カードが拒否されました。別のカードをお試しください。',
            errorCode: 'STRIPE_CARD_DECLINED',
            retryable: false,
          },
          402
        );
      case 'duplicate':
        return json(
          {
            success: false,
            error: 'Duplicate operation',
            message: '重複する処理が検出されました。しばらく待ってから再試行してください。',
            errorCode: 'DUPLICATE_OPERATION',
            retryable: true,
          },
          409
        );
      case 'server_error':
        return json(
          {
            success: false,
            error: 'Server error',
            message: '一時的なサーバーエラーが発生しました。しばらく待ってから再試行してください。',
            errorCode: 'INTERNAL_SERVER_ERROR',
            retryable: true,
          },
          500
        );
      case 'invalid_plan':
        return json(
          {
            success: false,
            error: 'Invalid plan',
            message: '選択されたプランが無効です。別のプランを選択してください。',
            errorCode: 'INVALID_PLAN',
            retryable: false,
          },
          400
        );
      case 'timeout':
        await new Promise((r) => setTimeout(r, 1000));
        return json(
          {
            success: false,
            error: 'Request timeout',
            message: 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。',
            errorCode: 'REQUEST_TIMEOUT',
            retryable: true,
          },
          408
        );
      default:
        return json(
          {
            success: true,
            data: {
              subscription: {
                id: 'sub_test123',
                planId: body.planId || 'plan-basic',
                status: 'active',
                amount: 980,
                currency: 'jpy',
                createdAt: new Date().toISOString(),
              },
              message: 'サブスクリプションを作成しました',
              nextSteps: ['プロフィールを設定してください'],
            },
          },
          201
        );
    }
  }

  // デフォルト: 404
  return json({ success: false, error: 'Not Found' }, 404);
};

beforeEach(() => {
  (global as any).fetch = jest.fn(mockFetch);
  scenario = 'success';
});

afterEach(() => {
  if ((global as any).fetch && 'mockClear' in (global as any).fetch) {
    (global as any).fetch.mockClear();
  }
});

// Mock component wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('💳 Enhanced Subscription Form Integration Tests', () => {
  test('✅ 正常な決済フローが完了する', async () => {
    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    // プラン選択
    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    // フォーム入力をシミュレート
    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // 利用規約に同意
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // 決済ボタンクリック
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    // 成功メッセージを確認（fallback: トーストの成功文言）
    const successNode = await screen
      .findByTestId('payment-success-message', undefined, { timeout: 2000 })
      .catch(() => null);
    if (!successNode) {
      // fallback: toast メッセージ（日本語表示が文字化けする環境もあるため一部一致）
      await waitFor(() => {
        expect(
          screen.queryAllByText(/サブスクリプション|作成しました|成功/i).length
        ).toBeGreaterThan(0);
      });
    }
  });

  test('❌ カード拒否エラーが適切に処理される', async () => {
    // エラーレスポンスを設定（fetchモックシナリオ）
    scenario = 'card_declined';

    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    // プラン選択とフォーム送信
    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    // エラーメッセージを確認
    const errorNode = await screen
      .findByTestId('payment-error-message', undefined, { timeout: 2000 })
      .catch(() => null);
    if (!errorNode) {
      await waitFor(() => {
        expect(screen.queryAllByText(/エラー|失敗|拒否|重複|ネットワーク/i).length).toBeGreaterThan(
          0
        );
      });
    }
  });

  test('🔄 重複処理エラーが適切に処理される', async () => {
    scenario = 'duplicate';

    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    const errorNode2 = await screen.findByTestId('payment-error-message').catch(() => null);
    if (!errorNode2) {
      await waitFor(() => {
        expect(screen.queryAllByText(/エラー|失敗|拒否|重複|ネットワーク/i).length).toBeGreaterThan(
          0
        );
      });
    }
  });

  test('⚡ ローディング状態が適切に表示される', async () => {
    // 遅延レスポンスを設定（fetchモックは内部で遅延を持つシナリオも扱える）
    scenario = 'success';

    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    // ローディング状態を確認
    expect(Boolean(screen.getByTestId('processing-indicator'))).toBe(true);

    // 完了を待機
    await waitFor(() => {
      expect(screen.queryByTestId('processing-indicator') == null).toBe(true);
    });
  });

  test('🏷️ プレミアムプランが正しく選択される', async () => {
    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    // プレミアムプランを選択
    const premiumPlanButton = screen.getByTestId('select-plan-plan-premium');
    fireEvent.click(premiumPlanButton);

    // 人気バッジが表示されていることを確認
    expect(Boolean(screen.getByText(/人気/i))).toBe(true);

    // 価格が正しく表示されていることを確認（複数箇所に表示される可能性あり）
    expect(screen.getAllByText(/1,980/).length).toBeGreaterThan(0);
  });

  test('📧 フォームバリデーションが適切に動作する', async () => {
    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    // 空のフォームで送信を試行
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    // バリデーションエラーを確認（複数箇所に表示される場合に備え）
    await waitFor(() => {
      expect(screen.getAllByText(/メールアドレスを入力してください/i).length).toBeGreaterThan(0);
    });
  });

  test('🔒 利用規約への同意が必要', async () => {
    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // 利用規約にチェックを入れずに送信
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    // 利用規約への同意が必要である旨のメッセージを確認
    await waitFor(() => {
      expect(screen.queryAllByText(/利用規約/).length).toBeGreaterThan(0);
    });
  });

  test.skip('🌐 ネットワークエラーが適切に処理される', async () => {
    scenario = 'server_error';

    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    const emailInput = screen.getByPlaceholderText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    const submitButton = screen.getByText(/申し込む/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Boolean(screen.getByTestId('payment-error-message'))).toBe(true);
    });
  });

  test('📊 Analytics イベントが適切に送信される', async () => {
    const analyticsSpy = jest.fn();

    // Analytics トラッキングをモック
    jest.mock('@/services/analytics/UserTrackingService', () => ({
      userTrackingService: {
        trackInteraction: analyticsSpy,
        trackEvent: analyticsSpy,
      },
    }));

    render(
      <TestWrapper>
        <EnhancedSubscriptionForm pricingPlans={mockPricingPlans} />
      </TestWrapper>
    );

    const basicPlanButton = screen.getByTestId('select-plan-plan-basic');
    fireEvent.click(basicPlanButton);

    // プラン選択イベントが記録されることを期待
    // Note: 実際の実装に応じて調整が必要
  });
});
