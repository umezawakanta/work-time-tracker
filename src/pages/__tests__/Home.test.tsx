import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('Home', () => {
  test('renders Home component', () => {
    render(<Home />, { wrapper: TestWrapper });
    expect(screen.getByText('LifeSyncへようこそ')).toBeInTheDocument();
    expect(screen.getByText('効率的な時間管理')).toBeInTheDocument();
    expect(screen.getByText('詳細な分析')).toBeInTheDocument();
  });

  test('contains links to work time tracker and reports', () => {
    render(<Home />, { wrapper: TestWrapper });
    expect(screen.getByRole('link', { name: 'LifeSyncを開始' })).toHaveAttribute(
      'href',
      '/work-time'
    );
    expect(screen.getByRole('link', { name: 'レポートを見る' })).toHaveAttribute(
      'href',
      '/reports'
    );
  });
});
