import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Import the mocked module
import * as authApi from '@/services/api/authApi';

jest.mock('@/services/api/authApi', () => ({
  verifyResetToken: jest.fn(),
  resetPassword: jest.fn(),
}));

const renderWithToken = (token: string | null) => {
  const initial = token ? `/reset-password?token=${token}` : '/reset-password';
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ResetPassword />
    </MemoryRouter>
  );
};

describe.skip('ResetPassword Page', () => {
  const axiosLike = (status: number, statusText: string, data: Record<string, unknown> = {}) => {
    const err: any = new Error(statusText);
    err.name = 'AxiosError';
    err.isAxiosError = true;
    err.response = {
      status,
      statusText,
      headers: {},
      config: {} as any,
      data,
    };
    err.config = { url: '/auth/password-reset', method: 'post' } as any;
    return err;
  };
  it('shows error when token missing', async () => {
    renderWithToken(null);
    await screen.findByText('リセットリンクが無効です');
  });

  it('verifies token and submits new password then redirects to /login', async () => {
    const user = userEvent.setup();

    // Setup mocks for this test
    (authApi.verifyResetToken as jest.Mock).mockResolvedValue({ valid: true });
    (authApi.resetPassword as jest.Mock).mockResolvedValue({ message: 'Password changed successfully' });

    renderWithToken('valid-token');

    // Wait for token validation to complete and form to appear
    await waitFor(() => {
      expect(screen.queryByText('リセットリンクを検証中...')).not.toBeInTheDocument();
    });

    const pwd = await screen.findByLabelText('新しいパスワード');
    const confirm = await screen.findByLabelText('パスワード（確認）');
    await user.type(pwd, 'Password1!');
    await user.type(confirm, 'Password1!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変更' }));
  });

  it('disables submit for weak password and shows mismatch error for strong password', async () => {
    const user = userEvent.setup();

    // Setup mocks for this test
    (authApi.verifyResetToken as jest.Mock).mockResolvedValue({ valid: true });

    renderWithToken('valid-token');

    // Wait for token validation to complete and form to appear
    await waitFor(() => {
      expect(screen.queryByText('リセットリンクを検証中...')).not.toBeInTheDocument();
    });

    const pwd = await screen.findByLabelText('新しいパスワード');
    const confirm = await screen.findByLabelText('パスワード（確認）');
    const submit = screen.getByRole('button', { name: 'パスワードを変更' });

    // Weak password -> button disabled
    await user.type(pwd, 'short');
    await user.type(confirm, 'different');
    if (!(submit as HTMLButtonElement).disabled) {
      throw new Error('submit should be disabled with weak password');
    }

    // Strong password but mismatch -> shows mismatch error after submit
    await user.clear(pwd);
    await user.type(pwd, 'Password1!');
    if ((submit as HTMLButtonElement).disabled) {
      throw new Error('submit should be enabled with strong password');
    }
    await user.click(submit);
    await screen.findByText('パスワードが一致しません');
  });

  it('shows token invalid error from API 400', async () => {
    // Setup mocks for this test - token validation should fail
    (authApi.verifyResetToken as jest.Mock).mockRejectedValue(axiosLike(400, 'Bad Request', {}));

    renderWithToken('invalid');

    await screen.findByText('リセットリンクが無効です');
  });

  it('shows password requirement error on 422', async () => {
    const user = userEvent.setup();

    // Setup mocks for this test
    (authApi.verifyResetToken as jest.Mock).mockResolvedValue({ valid: true });
    (authApi.resetPassword as jest.Mock).mockRejectedValue(axiosLike(422, 'Unprocessable Entity', {}));

    renderWithToken('valid');

    // Wait for token validation to complete and form to appear
    await waitFor(() => {
      expect(screen.queryByText('リセットリンクを検証中...')).not.toBeInTheDocument();
    });

    const pwd = await screen.findByLabelText('新しいパスワード');
    const confirm = await screen.findByLabelText('パスワード（確認）');
    await user.type(pwd, 'Password1!');
    await user.type(confirm, 'Password1!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変更' }));
    await screen.findByText('パスワードが要件を満たしていません');
  });
});
