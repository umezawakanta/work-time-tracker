import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import { AxiosError } from 'axios';

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/services/api/authApi', () => ({
  requestPasswordReset: jest.fn().mockResolvedValue({ message: 'ok' }),
}));

describe('ForgotPassword Page', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

  it('validates email format and disables submit until valid', async () => {
    const user = userEvent.setup();
    renderPage();

    const email = screen.getByLabelText('メールアドレス');
    const submit = screen.getByRole('button', { name: 'リセットメールを送信' });

    expect(submit).toBeDisabled();
    await user.type(email, 'invalid');
    expect(submit).toBeDisabled();
    await user.clear(email);
    await user.type(email, 'test@example.com');
    expect(submit).toBeEnabled();
  });

  it('submits and shows success state', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('メールアドレス'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }));

    await waitFor(() => {
      expect(screen.getByText('メールを送信しました')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  it('shows 404 message when email not found', async () => {
    const user = userEvent.setup();
    const { requestPasswordReset } = jest.requireMock('@/services/api/authApi');
    const axiosError = new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as any,
      data: { message: 'not found' },
    });
    requestPasswordReset.mockRejectedValueOnce(axiosError);

    renderPage();

    await user.type(screen.getByLabelText('メールアドレス'), 'none@example.com');
    await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }));

    await waitFor(() => {
      expect(screen.getByText('このメールアドレスは登録されていません')).toBeInTheDocument();
    });
  });

  it('shows 429 message when rate limited', async () => {
    const user = userEvent.setup();
    const { requestPasswordReset } = jest.requireMock('@/services/api/authApi');
    const axiosError = new AxiosError(
      'Too Many Requests',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
        data: { message: 'rate' },
      }
    );
    requestPasswordReset.mockRejectedValueOnce(axiosError);

    renderPage();

    await user.type(screen.getByLabelText('メールアドレス'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'パスワードリセットの要求が多すぎます。しばらく時間をおいてからお試しください'
        )
      ).toBeInTheDocument();
    });
  });
});
