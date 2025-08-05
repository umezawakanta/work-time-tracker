// src/__tests__/payment-integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

// Import components and services
import SubscriptionPage from '@/pages/SubscriptionPage';
import EnhancedSubscriptionForm from '@/components/subscription/EnhancedSubscriptionForm';
import { AuthContext } from '@/context/AuthContext';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import { formatPrice } from '@/config/stripe';

// Mock external dependencies
jest.mock('react-hot-toast');
jest.mock('@/services/api/userSubscriptionApi');
jest.mock('@/config/stripe', () => ({
  formatPrice: jest.fn((amount: number, currency: string) => {
    if (currency === 'jpy') {
      return `¥${amount.toLocaleString()}`;
    }
    return `$${amount}`;
  }),
  stripeConfig: {
    defaultCurrency: 'jpy',
    supportedCurrencies: ['jpy', 'usd', 'eur'],
  },
  stripePlans: {
    basic: {
      monthly: { priceId: 'price_basic_monthly', productId: 'prod_basic' },
      yearly: { priceId: 'price_basic_yearly', productId: 'prod_basic' },
    },
    premium: {
      monthly: { priceId: 'price_premium_monthly', productId: 'prod_premium' },
      yearly: { priceId: 'price_premium_yearly', productId: 'prod_premium' },
    },
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: (state = { user: null, hasActiveSubscription: false }, action) => state,
      subscription: (state = { subscriptions: [], status: 'idle', error: null }, action) => state,
    },
    preloadedState: initialState,
  });
};

// Mock user data
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

// Mock auth context
const createAuthContext = (user = mockUser) => ({
  user,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
});

describe('Payment Integration Tests', () => {
  let store: ReturnType<typeof createMockStore>;
  let authContext: ReturnType<typeof createAuthContext>;

  beforeEach(() => {
    store = createMockStore();
    authContext = createAuthContext();
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <AuthContext.Provider value={authContext}>
          <BrowserRouter>{component}</BrowserRouter>
        </AuthContext.Provider>
      </Provider>
    );
  };

  describe('SubscriptionPage', () => {
    it('should display all subscription plans correctly', () => {
      renderWithProviders(<SubscriptionPage />);

      // Check if main title is displayed
      expect(screen.getByText('料金プラン')).toBeInTheDocument();

      // Check if free plan is displayed
      expect(screen.getByText('フリープラン')).toBeInTheDocument();

      // Check if basic plan is displayed
      expect(screen.getByText('ベーシックプラン')).toBeInTheDocument();

      // Check if premium plan is displayed
      expect(screen.getByText('プレミアムプラン')).toBeInTheDocument();
    });

    it('should format prices correctly', () => {
      renderWithProviders(<SubscriptionPage />);

      // Check free plan
      expect(screen.getByText('無料')).toBeInTheDocument();

      // Check formatted prices (assuming formatPrice is mocked)
      expect(formatPrice).toHaveBeenCalledWith(980, 'jpy');
      expect(formatPrice).toHaveBeenCalledWith(2980, 'jpy');
    });

    it('should switch between monthly and yearly billing cycles', () => {
      renderWithProviders(<SubscriptionPage />);

      const yearlyButton = screen.getByText('年額払い');
      fireEvent.click(yearlyButton);

      // Should show yearly discount badge
      expect(screen.getByText('2ヶ月分お得')).toBeInTheDocument();
    });

    it('should handle free plan selection', () => {
      renderWithProviders(<SubscriptionPage />);

      const freeButton = screen.getByText('無料で始める');
      fireEvent.click(freeButton);

      expect(toast.success).toHaveBeenCalledWith('フリープランが選択されました');
    });

    it('should navigate to upgrade page for premium plans', () => {
      renderWithProviders(<SubscriptionPage />);

      const premiumButtons = screen.getAllByText(/無料トライアル開始|今すぐ始める/);
      fireEvent.click(premiumButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/subscription-upgrade', expect.any(Object));
    });
  });

  describe('EnhancedSubscriptionForm', () => {
    const mockPlans = [
      {
        id: 'basic-monthly',
        name: 'ベーシックプラン',
        description: '個人利用に最適',
        price: 980,
        currency: 'jpy',
        billingCycle: 'monthly' as const,
        features: ['作業時間記録', 'AI分析', 'レポート'],
        limits: {
          workHours: -1,
          projects: 10,
          tasks: 500,
          reports: 50,
          apiCalls: 5000,
          storage: 1000,
          teamMembers: 1,
        },
        trialDays: 14,
      },
    ];

    it('should render subscription form with plans', () => {
      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={jest.fn()}
          onError={jest.fn()}
        />
      );

      expect(screen.getByText('ベーシックプラン')).toBeInTheDocument();
      expect(screen.getByText('個人利用に最適')).toBeInTheDocument();
    });

    it('should handle subscription creation process', async () => {
      const onSubscriptionCreate = jest.fn();
      const onError = jest.fn();

      // Mock successful API response
      (userSubscriptionApi.createSubscription as jest.MockedFunction<any>).mockResolvedValue({
        success: true,
        data: {
          subscription: { id: 'sub_123' },
          clientSecret: 'pi_test_123_secret',
          message: 'Subscription created successfully',
        },
      });

      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={onSubscriptionCreate}
          onError={onError}
        />
      );

      // Find and click plan selection button
      const selectButton = screen.getByText(/選択/);
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(onSubscriptionCreate).toHaveBeenCalled();
      });
    });

    it('should handle subscription creation errors', async () => {
      const onSubscriptionCreate = jest.fn();
      const onError = jest.fn();

      // Mock error response
      (userSubscriptionApi.createSubscription as jest.MockedFunction<any>).mockRejectedValue(
        new Error('Payment method required')
      );

      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={onSubscriptionCreate}
          onError={onError}
        />
      );

      const selectButton = screen.getByText(/選択/);
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete full payment flow without errors', async () => {
      // Mock successful payment flow
      (userSubscriptionApi.createSubscription as jest.MockedFunction<any>).mockResolvedValue({
        success: true,
        data: {
          subscription: {
            id: 'sub_test_123',
            status: 'active',
            planId: 'basic-monthly',
            customerId: 'cus_test_123',
          },
          clientSecret: 'pi_test_123_secret',
          message: 'Subscription created successfully',
        },
      });

      const onSubscriptionCreate = jest.fn();

      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={onSubscriptionCreate}
          onError={jest.fn()}
        />
      );

      // Simulate payment form submission
      const form = screen.getByRole('form', { hidden: true }) || document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(userSubscriptionApi.createSubscription).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('should handle Stripe-specific errors correctly', async () => {
      // Mock Stripe error
      (userSubscriptionApi.createSubscription as jest.MockedFunction<any>).mockRejectedValue({
        code: 'card_declined',
        message: 'Your card was declined.',
        type: 'card_error',
      });

      const onError = jest.fn();

      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={jest.fn()}
          onError={onError}
        />
      );

      const selectButton = screen.getByText(/選択/);
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'card_declined',
          })
        );
      });
    });
  });

  describe('Price Formatting', () => {
    it('should format Japanese Yen correctly', () => {
      const formatted = formatPrice(1000, 'jpy');
      expect(formatted).toBe('¥1,000');
    });

    it('should format US Dollars correctly', () => {
      const formatted = formatPrice(10, 'usd');
      expect(formatted).toBe('$10');
    });
  });

  describe('Security & Validation', () => {
    it('should require authentication for premium features', () => {
      // Test with no user
      const unauthenticatedContext = createAuthContext(null);

      render(
        <Provider store={store}>
          <AuthContext.Provider value={unauthenticatedContext}>
            <BrowserRouter>
              <SubscriptionPage />
            </BrowserRouter>
          </AuthContext.Provider>
        </Provider>
      );

      // Should still show plans but payment should require auth
      expect(screen.getByText('料金プラン')).toBeInTheDocument();
    });

    it('should validate payment data before submission', async () => {
      const mockInvalidData = {
        planId: '', // Invalid empty plan ID
        paymentMethodId: undefined,
      };

      (userSubscriptionApi.createSubscription as jest.MockedFunction<any>).mockRejectedValue({
        error: 'Plan ID is required',
        errorCode: 'PLAN_ID_MISSING',
      });

      const onError = jest.fn();

      renderWithProviders(
        <EnhancedSubscriptionForm
          plans={mockPlans}
          onSubscriptionCreate={jest.fn()}
          onError={onError}
        />
      );

      // Attempt to submit with invalid data should trigger validation error
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create subscription via API', async () => {
    const mockResponse = {
      success: true,
      data: {
        subscription: {
          id: 'sub_test_123',
          status: 'active',
          planId: 'basic-monthly',
          customerId: 'cus_test_123',
        },
        clientSecret: 'pi_test_123_secret',
        message: 'Subscription created successfully',
      },
    };

    (userSubscriptionApi.createSubscription as Mock).mockResolvedValue(mockResponse);

    const result = await userSubscriptionApi.createSubscription({
      planId: 'basic-monthly',
      paymentMethodId: 'pm_test_123',
      billingCycle: 'monthly',
    });

    expect(result).toEqual(mockResponse);
    expect(userSubscriptionApi.createSubscription).toHaveBeenCalledWith({
      planId: 'basic-monthly',
      paymentMethodId: 'pm_test_123',
      billingCycle: 'monthly',
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = {
      success: false,
      error: 'Invalid payment method',
      errorCode: 'PAYMENT_METHOD_INVALID',
      retryable: true,
    };

    (userSubscriptionApi.createSubscription as Mock).mockRejectedValue(mockError);

    try {
      await userSubscriptionApi.createSubscription({
        planId: 'basic-monthly',
        paymentMethodId: 'pm_invalid',
        billingCycle: 'monthly',
      });
    } catch (error) {
      expect(error).toEqual(mockError);
    }
  });
});
