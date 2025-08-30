import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import Register from '../Register';

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock services used by Register indirectly
jest.mock('@/services/api/apiConfig', () => ({
  api: {
    post: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' }, token: 't' } }),
  },
}));

jest.mock('@/services/auth/TokenManager', () => ({
  tokenManager: {
    setTokens: jest.fn().mockResolvedValue(undefined),
  },
}));

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Register />
    </MemoryRouter>
  );
};

describe('Register Page', () => {
  it('renders form fields', () => {
    renderPage();

    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderPage();

    // ボタンが disabled なので、利用規約に同意して有効化
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);

    const submit = screen.getByRole('button', { name: 'アカウントを作成' });
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText('名前を入力してください')).toBeInTheDocument();
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('submits successfully and navigates to /', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('名前'), '太郎');
    await user.type(screen.getByLabelText('メールアドレス'), 'taro@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1');

    // 同意チェック
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);

    const submit = screen.getByRole('button', { name: 'アカウントを作成' });
    await user.click(submit);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to /login with message when no token returned', async () => {
    const user = userEvent.setup();
    const { api } = jest.requireMock('@/services/api/apiConfig');
    api.post.mockResolvedValueOnce({ data: { user: { id: 'u2' } } });

    renderPage();

    await user.type(screen.getByLabelText('名前'), '花子');
    await user.type(screen.getByLabelText('メールアドレス'), 'hanako@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: expect.objectContaining({
          message: expect.stringContaining('登録が完了しました'),
          email: 'hanako@example.com',
        }),
      });
    });
  });

  it('shows email field error on duplicate email (409)', async () => {
    const user = userEvent.setup();
    const { api } = jest.requireMock('@/services/api/apiConfig');
    const axiosError = new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as any,
      data: { field: 'email', message: '既に登録されています' },
    });
    api.post.mockRejectedValueOnce(axiosError as unknown as Error);

    renderPage();

    await user.type(screen.getByLabelText('名前'), '次郎');
    await user.type(screen.getByLabelText('メールアドレス'), 'dup@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(screen.getByText('既に登録されています')).toBeInTheDocument();
    });
  });
});
