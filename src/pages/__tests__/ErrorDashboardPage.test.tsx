import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ErrorDashboardPage from '@/pages/ErrorDashboardPage';

describe('ErrorDashboardPage', () => {
  it('renders title and login button', () => {
    render(
      <MemoryRouter>
        <ErrorDashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('エラー監視ダッシュボード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });
});
