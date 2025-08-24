import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin, Mail, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SocialShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  url = window.location.href,
  title = 'Work Time Tracker - AI powered task management',
  description = 'ADHDユーザー特化のAI搭載タスク管理ツール。アイゼンハワーマトリックスでタスクを自動分類！',
  image = '/og-image.png',
  variant = 'outline',
  size = 'default',
}) => {
  // Using globalThis.gtag if present; avoid TS 'declare' in block scope
  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    image: encodeURIComponent(image),
  };

  const shareToTwitter = () => {
    try {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${shareData.title}&url=${shareData.url}&hashtags=ADHD,TaskManagement,AI,Productivity`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    } catch {
      // ignore popup errors in test/jsdom
    } finally {
      trackShare('twitter');
    }
  };

  const shareToFacebook = () => {
    try {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    } catch {
      // ignore popup errors in test/jsdom
    } finally {
      trackShare('facebook');
    }
  };

  const shareToLinkedIn = () => {
    try {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}&title=${shareData.title}&summary=${shareData.description}`;
      window.open(linkedinUrl, '_blank', 'width=600,height=400');
    } catch {
      // ignore popup errors in test/jsdom
    } finally {
      trackShare('linkedin');
    }
  };

  const shareByEmail = () => {
    const emailSubject = encodeURIComponent(title);
    const emailBody = encodeURIComponent(`${description}\n\n${url}`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = emailUrl;
    trackShare('email');
  };

  const copyToClipboard = async () => {
    try {
      // Call as a method to preserve `this` binding expected by some test environments
      await (navigator as any).clipboard.writeText(url);
      toast.success('🔗 リンクをクリップボードにコピーしました！');
    } catch {
      // Fallback only if a distinct navigator object exists
      try {
        const winNav = (window as any).navigator;
        if (winNav && winNav !== navigator && winNav.clipboard?.writeText) {
          await winNav.clipboard.writeText(url);
          toast.success('🔗 リンクをクリップボードにコピーしました！');
        } else {
          throw new Error('no distinct navigator');
        }
      } catch {
        toast.error('リンクのコピーに失敗しました');
      }
    } finally {
      trackShare('copy');
    }
  };

  const trackShare = (platform: string) => {
    // アナリティクス記録
    console.log(`📊 Share tracked: ${platform} - ${title}`);

    // Google Analytics があれば送信
    const ga = (globalThis as any).gtag as
      | ((event: string, action: string, params?: Record<string, unknown>) => void)
      | undefined;
    if (typeof ga === 'function') {
      ga('event', 'share', {
        method: platform,
        content_type: 'webpage',
        item_id: url,
      });
    }

    // カスタムアナリティクスに送信
    // swallow errors to avoid unhandled rejections in tests
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'social_share',
        platform,
        url,
        title,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter') {
      const active = document.activeElement as HTMLElement | null;
      if (active && active.getAttribute('role') === 'menuitem') {
        active.click();
        e.preventDefault();
        return;
      }
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const container = menuRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return;
    const currentIndex = items.findIndex((el) => el === document.activeElement);
    let nextIndex = 0;
    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : Math.min(items.length - 1, currentIndex + 1);
    } else {
      nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    }
    items[nextIndex].focus();
    e.preventDefault();
  };

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Focus first menu item after opening
      setTimeout(() => {
        const container = menuRef.current;
        if (!container) return;
        const items = container.querySelectorAll<HTMLElement>('[role="menuitem"]');
        if (items.length > 0) {
          items[0].focus();
        }
      }, 0);
    } else if (e.key === 'ArrowDown') {
      const container = menuRef.current;
      if (!container) return;
      const items = container.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (items.length > 0) {
        items[0].focus();
        e.preventDefault();
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-2"
          aria-label="シェア"
          onKeyDown={handleTriggerKeyDown}
        >
          <Share2 className="h-4 w-4" />
          シェア
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        ref={menuRef as any}
        onKeyDown={handleMenuKeyDown}
      >
        <DropdownMenuItem onClick={shareToTwitter as any} className="gap-2" tabIndex={-1}>
          <Twitter className="h-4 w-4 text-blue-500" />
          Twitter / X で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToFacebook as any} className="gap-2" tabIndex={-1}>
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToLinkedIn as any} className="gap-2" tabIndex={-1}>
          <Linkedin className="h-4 w-4 text-blue-700" />
          LinkedIn で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareByEmail as any} className="gap-2" tabIndex={-1}>
          <Mail className="h-4 w-4 text-gray-600" />
          メールで共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyToClipboard as any} className="gap-2" data-copy-url={url}>
          <Link className="h-4 w-4 text-gray-600" />
          リンクをコピー
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShareButton;
