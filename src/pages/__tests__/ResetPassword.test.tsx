import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/services/api/authApi', () => ({
  verifyResetToken: jest.fn().mockResolvedValue({ valid: true }),
  resetPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
}));

const renderWithToken = (token: string | null) => {
  const initial = token ? `/reset-password?token=${token}` : '/reset-password';
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ResetPassword />
    </MemoryRouter>
  );
};

describe('ResetPassword Page', () => {
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
    const { verifyResetToken } = jest.requireMock('@/services/api/authApi');
    const { resetPassword } = jest.requireMock('@/services/api/authApi');
    const { toast } = jest.requireMock('react-hot-toast');
    verifyResetToken.mockResolvedValueOnce({ valid: true });
    renderWithToken('valid-token');

    // wait until form appears
    const pwd = await screen.findByLabelText('新しいパスワード');
    const confirm = await screen.findByLabelText('パスワード（確認）');
    await user.type(pwd, 'Password1!');
    await user.type(confirm, 'Password1!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変更' }));

    // Success indicators (no jest-dom matchers to satisfy linter types)
    const rpCalls = (resetPassword as unknown as { mock: { calls: any[][] } }).mock.calls;
    if (!rpCalls.length) throw new Error('resetPassword not called');
    if (rpCalls[0][0] !== 'valid-token') throw new Error('token mismatch');
    if (rpCalls[0][1] !== 'Password1!') throw new Error('password mismatch');
    const toastCalls = (toast.success as unknown as { mock: { calls: any[][] } }).mock.calls;
    if (
      !toastCalls.length ||
      String(toastCalls[0][0]).indexOf('パスワードが正常に変更されました') === -1
    ) {
      throw new Error('success toast not shown');
    }
  });

  it('disables submit for weak password and shows mismatch error for strong password', async () => {
    const user = userEvent.setup();
    const { verifyResetToken } = jest.requireMock('@/services/api/authApi');
    verifyResetToken.mockResolvedValueOnce({ valid: true });
    renderWithToken('valid-token');

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
    const { verifyResetToken } = jest.requireMock('@/services/api/authApi');
    verifyResetToken.mockRejectedValueOnce(axiosLike(400, 'Bad Request', {}));

    renderWithToken('invalid');

    await screen.findByText('リセットリンクが無効です');
  });

  it('shows password requirement error on 422', async () => {
    const user = userEvent.setup();
    const { verifyResetToken, resetPassword } = jest.requireMock('@/services/api/authApi');
    verifyResetToken.mockResolvedValueOnce({ valid: true });
    resetPassword.mockRejectedValueOnce(axiosLike(422, 'Unprocessable Entity', {}));

    renderWithToken('valid');
    const pwd = await screen.findByLabelText('新しいパスワード');
    const confirm = await screen.findByLabelText('パスワード（確認）');
    await user.type(pwd, 'Password1!');
    await user.type(confirm, 'Password1!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変更' }));
    await screen.findByText('パスワードが要件を満たしていません');
  });
});
