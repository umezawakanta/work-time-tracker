import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '@/pages/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders tabs including error monitoring tab', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('管理者ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('概要')).toBeInTheDocument();
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    expect(screen.getByText('分析')).toBeInTheDocument();
    expect(screen.getByText('エラー監視')).toBeInTheDocument();
  });
});
