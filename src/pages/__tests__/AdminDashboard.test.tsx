import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders tabs including error monitoring tab', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('管理者ダッシュボード')).toBeInTheDocument());
    expect(screen.getAllByText('概要').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ユーザー').length).toBeGreaterThan(0);
    expect(screen.getAllByText('分析').length).toBeGreaterThan(0);
    expect(screen.getAllByText('エラー監視').length).toBeGreaterThan(0);
  });
});
