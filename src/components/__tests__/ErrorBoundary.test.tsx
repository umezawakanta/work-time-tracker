import React from 'react';
import { render, screen, fireEvent } from '@/test-utils/render';
import ErrorBoundary from '@/components/ErrorBoundary';

const OkChild: React.FC = () => <div>正常に表示</div>;

const Bomb: React.FC<{ message?: string }> = ({ message = 'boom' }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('エラーが無い場合は子要素をそのまま表示する', () => {
    render(
      <ErrorBoundary>
        <OkChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常に表示')).toBeInTheDocument();
  });

  it('エラー発生時に汎用メッセージを表示し、設定ボタンは出さない（default variant）', () => {
    render(
      <ErrorBoundary>
        {/* エラーを発生させる子 */}
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(
      screen.getByText('申し訳ありませんが、予期せぬエラーが発生しました。')
    ).toBeInTheDocument();
    expect(screen.queryByText('設定を開く')).not.toBeInTheDocument();
    expect(screen.getByText('再読み込み')).toBeInTheDocument();
  });

  it('variant="app" かつ AI関連エラー時、AI向けメッセージと設定ボタンを表示する', () => {
    render(
      <ErrorBoundary variant="app">
        <Bomb message="OpenAI request failed" />
      </ErrorBoundary>
    );

    expect(screen.getByText('AI機能でエラーが発生しました')).toBeInTheDocument();
    expect(
      screen.getByText(
        'APIキー・レート制限・ネットワーク状態をご確認ください。問題が続く場合は設定を見直してください。'
      )
    ).toBeInTheDocument();

    const settingsBtn = screen.getByText('設定を開く');
    expect(settingsBtn).toBeInTheDocument();

    fireEvent.click(settingsBtn);
    expect(window.location.assign).toHaveBeenCalledWith('/settings');
  });

  it('再読み込みボタンで reload が呼ばれる', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    const reloadBtn = screen.getByText('再読み込み');
    fireEvent.click(reloadBtn);
    expect(window.location.reload).toHaveBeenCalled();
  });
});
