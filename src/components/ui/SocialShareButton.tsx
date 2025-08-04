import React from 'react';
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
  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    image: encodeURIComponent(image),
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareData.title}&url=${shareData.url}&hashtags=ADHD,TaskManagement,AI,Productivity`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    trackShare('twitter');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    trackShare('facebook');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}&title=${shareData.title}&summary=${shareData.description}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    trackShare('linkedin');
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
      await navigator.clipboard.writeText(url);
      toast.success('🔗 リンクをクリップボードにコピーしました！');
      trackShare('copy');
    } catch (error) {
      toast.error('リンクのコピーに失敗しました');
    }
  };

  const trackShare = (platform: string) => {
    // アナリティクス記録
    console.log(`📊 Share tracked: ${platform} - ${title}`);

    // Google Analytics があれば送信
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'webpage',
        item_id: url,
      });
    }

    // カスタムアナリティクスに送信
    try {
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
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          シェア
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2">
          <Twitter className="h-4 w-4 text-blue-500" />
          Twitter / X で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToFacebook} className="gap-2">
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2">
          <Linkedin className="h-4 w-4 text-blue-700" />
          LinkedIn で共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareByEmail} className="gap-2">
          <Mail className="h-4 w-4 text-gray-600" />
          メールで共有
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
          <Link className="h-4 w-4 text-gray-600" />
          リンクをコピー
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShareButton;
