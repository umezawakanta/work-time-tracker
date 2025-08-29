import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorDashboardPage from '@/pages/ErrorDashboardPage';

describe('ErrorDashboardPage', () => {
  it('renders title and login button', () => {
    render(<ErrorDashboardPage />);
    expect(screen.getByText('エラー監視ダッシュボード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });
});
