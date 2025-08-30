import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Layout from '../Layout';

// Mock useAuth to simulate authenticated user and capture setters
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'user@example.com', displayName: 'User' },
    setIsAuthenticated: jest.fn(),
    setUser: jest.fn(),
  }),
}));

// Mock logout API
const mockLogout = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/api/authApi', () => ({
  logout: () => mockLogout(),
}));

// Mock analytics to silence logs
jest.mock('@/lib/analytics', () => ({
  useAnalytics: () => ({ trackEvent: jest.fn(), identifyUser: jest.fn() }),
}));

// Mock theme context
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
}));

describe('Header Logout Button', () => {
  it('logs out and navigates to /login', async () => {
    const user = userEvent.setup();
    function LocationProbe() {
      const loc = useLocation();
      return <div data-testid="loc">{loc.pathname}</div>;
    }
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>content</div>
        </Layout>
        <LocationProbe />
      </MemoryRouter>
    );

    const btn = await screen.findByRole('button', { name: 'ログアウト' });
    await user.click(btn);

    expect(mockLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('loc')).toHaveTextContent('/login');
    });
  });
});
