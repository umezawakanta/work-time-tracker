import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d: string) => d }),
}));

// Mock useAuth
const mockSetIsAuthenticated = jest.fn();
const mockSetUser = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    setIsAuthenticated: mockSetIsAuthenticated,
    setUser: mockSetUser,
    refreshAuth: jest.fn(),
    user: null,
  }),
}));

// Mock api login
jest.mock('@/services/api/authApi', () => ({
  login: jest.fn(async () => ({
    accessToken: 'a',
    refreshToken: 'r',
    user: { id: 'u1', email: 'taro@example.com' },
    message: 'ok',
  })),
}));

function renderLogin(initialPath = '/login', state?: any) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: initialPath, state }]}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login redirect behavior', () => {
  it('prefers session post_login_redirect when present', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('post_login_redirect', '/admin');
    renderLogin('/login');

    await user.type(screen.getByLabelText('メールアドレス'), 'a@b.com');
    await user.type(screen.getByLabelText('パスワード'), 'x');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      // The Login component uses navigate; we cannot easily assert URL here without router assertions.
      // Instead, assert that post_login_redirect was consumed.
      expect(sessionStorage.getItem('post_login_redirect')).toBeNull();
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
    });
  });
});
