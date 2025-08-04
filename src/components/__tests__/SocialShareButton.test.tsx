/**
 * 📢 SNSシェアボタンテスト
 * 
 * ソーシャルメディアシェア機能のテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialShareButton from '@/components/ui/SocialShareButton';

// react-hot-toastをモック
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// window.openをモック
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// navigator.clipboardをモック
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// fetchをモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('📢 SocialShareButton コンポーネント', () => {
  const defaultProps = {
    url: 'https://example.com/test',
    title: 'Test Title',
    description: 'Test Description',
    image: '/test-image.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('✅ 基本表示機能', () => {
    test('シェアボタンが正常に表示される', () => {
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      expect(shareButton).toBeInTheDocument();
      expect(screen.getByText('シェア')).toBeInTheDocument();
    });

    test('ドロップダウンメニューが正常に表示される', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      expect(screen.getByText('Twitter / X で共有')).toBeInTheDocument();
      expect(screen.getByText('Facebook で共有')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn で共有')).toBeInTheDocument();
      expect(screen.getByText('メールで共有')).toBeInTheDocument();
      expect(screen.getByText('リンクをコピー')).toBeInTheDocument();
    });

    test('デフォルト値が正しく設定される', () => {
      render(<SocialShareButton />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      expect(shareButton).toBeInTheDocument();
    });

    test('カスタムvariantとsizeが適用される', () => {
      render(<SocialShareButton variant="ghost" size="sm" />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      expect(shareButton).toHaveClass('text-sm'); // size="sm"のクラス
    });
  });

  describe('🐦 Twitter/X シェア', () => {
    test('Twitterシェアが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const twitterOption = screen.getByText('Twitter / X で共有');
      await user.click(twitterOption);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      );

      // URLパラメータの確認
      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('text=Test%20Title');
      expect(calledUrl).toContain('url=https%3A%2F%2Fexample.com%2Ftest');
      expect(calledUrl).toContain('hashtags=ADHD,TaskManagement,AI,Productivity');
    });

    test('Twitterシェア時にアナリティクスが記録される', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const twitterOption = screen.getByText('Twitter / X で共有');
      await user.click(twitterOption);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('social_share'),
        })
      );
    });
  });

  describe('📘 Facebook シェア', () => {
    test('Facebookシェアが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const facebookOption = screen.getByText('Facebook で共有');
      await user.click(facebookOption);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://www.facebook.com/sharer/sharer.php'),
        '_blank',
        'width=600,height=400'
      );

      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('u=https%3A%2F%2Fexample.com%2Ftest');
      expect(calledUrl).toContain('quote=Test%20Title');
    });
  });

  describe('💼 LinkedIn シェア', () => {
    test('LinkedInシェアが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const linkedinOption = screen.getByText('LinkedIn で共有');
      await user.click(linkedinOption);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://www.linkedin.com/sharing/share-offsite/'),
        '_blank',
        'width=600,height=400'
      );

      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('url=https%3A%2F%2Fexample.com%2Ftest');
      expect(calledUrl).toContain('title=Test%20Title');
      expect(calledUrl).toContain('summary=Test%20Description');
    });
  });

  describe('✉️ メールシェア', () => {
    test('メールシェアが正常に動作する', async () => {
      const user = userEvent.setup();
      
      // window.location.hrefをモック
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as Location;

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const emailOption = screen.getByText('メールで共有');
      await user.click(emailOption);

      expect(window.location.href).toContain('mailto:');
      expect(window.location.href).toContain('subject=Test%20Title');
      expect(window.location.href).toContain('body=Test%20Description');

      // location.hrefを復元
      window.location = originalLocation;
    });
  });

  describe('🔗 リンクコピー', () => {
    test('リンクコピーが正常に動作する', async () => {
      const user = userEvent.setup();
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const copyOption = screen.getByText('リンクをコピー');
      await user.click(copyOption);

      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/test');

      const { toast } = await import('react-hot-toast');
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('🔗 リンクをクリップボードにコピーしました！');
      });
    });

    test('リンクコピー失敗時のエラーハンドリング', async () => {
      const user = userEvent.setup();
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const copyOption = screen.getByText('リンクをコピー');
      await user.click(copyOption);

      const { toast } = await import('react-hot-toast');
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('リンクのコピーに失敗しました');
      });
    });
  });

  describe('📊 アナリティクス追跡', () => {
    test('すべてのシェアアクションでアナリティクスが記録される', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      // Twitter
      const twitterOption = screen.getByText('Twitter / X で共有');
      await user.click(twitterOption);

      // アナリティクストラッキングが呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('"platform":"twitter"'),
        })
      );
    });

    test('Google Analyticsが利用可能な場合のトラッキング', async () => {
      const user = userEvent.setup();
      
      // gtagをモック
      const mockGtag = jest.fn();
      (global as any).gtag = mockGtag;

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const facebookOption = screen.getByText('Facebook で共有');
      await user.click(facebookOption);

      expect(mockGtag).toHaveBeenCalledWith('event', 'share', {
        method: 'facebook',
        content_type: 'webpage',
        item_id: 'https://example.com/test',
      });

      // gtagをクリーンアップ
      delete (global as any).gtag;
    });

    test('アナリティクスAPIエラー時も正常に動作する', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Analytics API error'));

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const linkedinOption = screen.getByText('LinkedIn で共有');
      
      // エラーが発生してもシェアは正常に動作する
      await user.click(linkedinOption);
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });

  describe('🎨 カスタマイズ機能', () => {
    test('カスタムURLとタイトルが正しく使用される', async () => {
      const user = userEvent.setup();
      const customProps = {
        url: 'https://custom.com/page',
        title: 'Custom Title',
        description: 'Custom Description',
      };

      render(<SocialShareButton {...customProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const twitterOption = screen.getByText('Twitter / X で共有');
      await user.click(twitterOption);

      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('url=https%3A%2F%2Fcustom.com%2Fpage');
      expect(calledUrl).toContain('text=Custom%20Title');
    });

    test('空のプロパティが適切に処理される', async () => {
      const user = userEvent.setup();
      const emptyProps = {
        url: '',
        title: '',
        description: '',
      };

      render(<SocialShareButton {...emptyProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const twitterOption = screen.getByText('Twitter / X で共有');
      await user.click(twitterOption);

      // エラーが発生せずにシェア処理が実行される
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });

  describe('⚠️ エラーハンドリング', () => {
    test('window.openが失敗した場合の処理', async () => {
      const user = userEvent.setup();
      mockWindowOpen.mockImplementationOnce(() => {
        throw new Error('Popup blocked');
      });

      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const twitterOption = screen.getByText('Twitter / X で共有');
      
      // エラーが発生してもアプリケーションが停止しない
      expect(() => user.click(twitterOption)).not.toThrow();
    });

    test('URLエンコーディングが正しく処理される', async () => {
      const user = userEvent.setup();
      const specialCharsProps = {
        url: 'https://example.com/test?param=value&other=特殊文字',
        title: 'Title with 特殊文字 & symbols',
        description: 'Description with #hashtags and @mentions',
      };

      render(<SocialShareButton {...specialCharsProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      await user.click(shareButton);

      const facebookOption = screen.getByText('Facebook で共有');
      await user.click(facebookOption);

      // 特殊文字が適切にエンコードされる
      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('%E7%89%B9%E6%AE%8A%E6%96%87%E5%AD%97'); // 特殊文字のエンコード
    });
  });

  describe('♿ アクセシビリティ', () => {
    test('適切なARIA属性が設定されている', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      expect(shareButton).toBeInTheDocument();

      await user.click(shareButton);

      // メニューアイテムのアクセシビリティ
      const twitterOption = screen.getByRole('menuitem', { name: /Twitter/i });
      expect(twitterOption).toBeInTheDocument();

      const facebookOption = screen.getByRole('menuitem', { name: /Facebook/i });
      expect(facebookOption).toBeInTheDocument();
    });

    test('キーボードナビゲーションが正常に動作する', async () => {
      const user = userEvent.setup();
      render(<SocialShareButton {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /シェア/i });
      
      // Tabキーでフォーカス
      await user.tab();
      expect(shareButton).toHaveFocus();

      // Enterキーでメニューを開く
      await user.keyboard('{Enter}');
      expect(screen.getByText('Twitter / X で共有')).toBeInTheDocument();

      // 矢印キーでメニュー内移動
      await user.keyboard('{ArrowDown}');
      const facebookOption = screen.getByRole('menuitem', { name: /Facebook/i });
      expect(facebookOption).toHaveFocus();

      // Enterキーで選択
      await user.keyboard('{Enter}');
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });
});

describe('📢 SocialShareButton 統合テスト', () => {
  test('完全なシェアフローが正常に動作する', async () => {
    const user = userEvent.setup();
    mockWriteText.mockResolvedValue(undefined);

    const props = {
      url: 'https://work-time-tracker.com',
      title: 'Work Time Tracker - AI搭載タスク管理',
      description: 'ADHDユーザー特化のAI搭載タスク管理ツール',
    };

    render(<SocialShareButton {...props} />);

    // 1. シェアボタンクリック
    const shareButton = screen.getByRole('button', { name: /シェア/i });
    await user.click(shareButton);

    // 2. 各プラットフォームでのシェア確認
    const platforms = [
      { name: 'Twitter / X で共有', url: 'twitter.com' },
      { name: 'Facebook で共有', url: 'facebook.com' },
      { name: 'LinkedIn で共有', url: 'linkedin.com' },
    ];

    for (const platform of platforms) {
      const option = screen.getByText(platform.name);
      await user.click(option);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining(platform.url),
        '_blank',
        'width=600,height=400'
      );

      // メニューを再度開く
      await user.click(shareButton);
    }

    // 3. リンクコピー確認
    const copyOption = screen.getByText('リンクをコピー');
    await user.click(copyOption);

    expect(mockWriteText).toHaveBeenCalledWith('https://work-time-tracker.com');

    // 4. アナリティクス記録確認
    expect(mockFetch).toHaveBeenCalledTimes(4); // Twitter, Facebook, LinkedIn, Copy
  });
});