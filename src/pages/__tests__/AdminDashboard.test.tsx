import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';

// モック設定
jest.mock('@/config/features', () => ({
  isFeatureAccessible: (path: string) => ({
    allowed: true,
    reason: undefined,
    feature: undefined,
  }),
}));

jest.mock('@/services/api/apiConfig', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        metrics: {
          users: { total: 100, active: 50, newToday: 5, churnRate: 2.1 },
          revenue: { mrr: 10000, arr: 120000, todayRevenue: 1000, conversionRate: 3.4 },
          system: { uptime: 99.9, responseTime: 100, errorRate: 0.2, activeConnections: 10 },
          support: { openTickets: 0, avgResponseTime: '2h', satisfaction: 4.6 },
        },
        priorityActions: [],
      },
    }),
  },
}));

jest.mock('@/hooks/useDerivedFeatureStatuses', () => ({
  useDerivedFeatureStatuses: () => ({
    data: {
      suggested: { admin: 'system_testing' },
      approved: { admin: 'system_testing' },
      effective: { admin: 'system_testing' },
    },
    refresh: jest.fn(),
  }),
}));

// AdminUsersPageをモック
jest.mock('@/pages/AdminUsersPage', () => 'div');

// AnalyticsDashboardをモック
jest.mock('@/components/analytics/AnalyticsDashboard', () => 'div');

// ErrorMonitoringDashboardをモック
jest.mock('@/components/development/ErrorMonitoringDashboard', () => 'div');

describe('AdminDashboard', () => {
  it('renders admin dashboard with title', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('管理者ダッシュボード')).toBeInTheDocument());
  });
});
