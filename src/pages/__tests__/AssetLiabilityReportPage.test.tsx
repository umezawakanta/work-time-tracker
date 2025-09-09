import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AssetLiabilityReportPage from '../AssetLiabilityReportPage';
import { server } from '../../__mocks__/server';

// MSWサーバーの設定
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// モックストア
const mockStore = configureStore({
  reducer: {
    asset: {
      entries: [
        {
          _id: 'asset_1',
          date: '2024-01-01',
          value: 1000000,
          description: '銀行預金',
          account: 'Bank Savings',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          _id: 'asset_2',
          date: '2024-01-15',
          value: 500000,
          description: '投資信託',
          account: 'Investment Fund',
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
        },
      ],
    },
    debt: {
      entries: [
        {
          _id: 'debt_1',
          date: '2024-01-01',
          value: 300000,
          description: '住宅ローン',
          account: 'Mortgage',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  },
});

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe.skip('AssetLiabilityReportPage Component', () => {
  test('should render the main page elements', async () => {
    render(
      <TestWrapper>
        <AssetLiabilityReportPage />
      </TestWrapper>
    );

    // ページの主要要素が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('資産負債レポート')).toBeInTheDocument();
    });
  });

  test('should display financial metrics cards', async () => {
    render(
      <TestWrapper>
        <AssetLiabilityReportPage />
      </TestWrapper>
    );

    // 財務指標カードが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('総資産')).toBeInTheDocument();
      expect(screen.getByText('総負債')).toBeInTheDocument();
      expect(screen.getByText('純資産')).toBeInTheDocument();
    });
  });

  test('should display asset and debt data', async () => {
    render(
      <TestWrapper>
        <AssetLiabilityReportPage />
      </TestWrapper>
    );

    // 資産・負債データが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('銀行預金')).toBeInTheDocument();
      expect(screen.getByText('投資信託')).toBeInTheDocument();
      expect(screen.getByText('住宅ローン')).toBeInTheDocument();
    });
  });

  test('should handle loading state', () => {
    render(
      <TestWrapper>
        <AssetLiabilityReportPage />
      </TestWrapper>
    );

    // ローディング状態が表示されることを確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('should display charts when data is available', async () => {
    render(
      <TestWrapper>
        <AssetLiabilityReportPage />
      </TestWrapper>
    );

    // チャートが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('資産負債トレンド')).toBeInTheDocument();
    });
  });
});
