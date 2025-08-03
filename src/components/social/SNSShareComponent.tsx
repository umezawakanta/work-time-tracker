import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  MessageCircle,
  Copy,
  Mail,
  QrCode,
  TrendingUp,
  Users,
  Heart,
  Zap,
  Target,
  Globe,
  Sparkles,
} from 'lucide-react';

interface ShareableContent {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
  via?: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (content: ShareableContent) => string;
  description: string;
  characterLimit?: number;
}

interface ShareStats {
  platform: string;
  shares: number;
  clicks: number;
  impressions: number;
  engagement: number;
}

/**
 * SNSシェアコンポーネント - ソーシャルメディア拡散システム
 */
const SNSShareComponent: React.FC<{
  content?: ShareableContent;
  showStats?: boolean;
  customizable?: boolean;
}> = ({ content: initialContent, showStats = false, customizable = false }) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [customContent, setCustomContent] = useState<ShareableContent>(
    initialContent || {
      title: 'Work Time Tracker - 究極の生産性管理ツール',
      description: '🎯 4象限タスク分類、🧠 AI統合、📊 包括的分析で生産性を革命的に向上！',
      url: window.location.href,
      hashtags: ['WorkTimeTracker', '生産性', 'AI', 'タスク管理', 'ADHD支援'],
      via: 'WorkTimeTracker',
    }
  );

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'twitter',
      name: 'Twitter (X)',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      characterLimit: 280,
      description: 'リアルタイム拡散に最適',
      shareUrl: (content) => {
        const text = `${content.title}\n\n${content.description}`;
        const hashtags = content.hashtags?.join(',') || '';
        const via = content.via || '';
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(content.url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent(via)}`;
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'コミュニティ共有に最適',
      shareUrl: (content) => {
        const text = `${content.title}\n\n${content.description}`;
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}&quote=${encodeURIComponent(text)}`;
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'bg-blue-700 hover:bg-blue-800',
      description: 'プロフェッショナル向け',
      shareUrl: (content) => {
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(content.description)}`;
      },
    },
    {
      id: 'line',
      name: 'LINE',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      description: '日本での個人共有に最適',
      shareUrl: (content) => {
        const text = `${content.title}\n${content.description}\n${content.url}`;
        return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(content.url)}&text=${encodeURIComponent(text)}`;
      },
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: 'フォーマルな共有',
      shareUrl: (content) => {
        const subject = content.title;
        const body = `${content.description}\n\n詳細はこちら: ${content.url}`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
    },
  ];

  // モックの共有統計データ
  const mockShareStats: ShareStats[] = [
    { platform: 'Twitter', shares: 342, clicks: 1287, impressions: 15420, engagement: 8.3 },
    { platform: 'Facebook', shares: 189, clicks: 756, impressions: 9840, engagement: 7.7 },
    { platform: 'LinkedIn', shares: 98, clicks: 423, impressions: 5670, engagement: 7.5 },
    { platform: 'LINE', shares: 267, clicks: 891, impressions: 12300, engagement: 7.2 },
    { platform: 'Email', shares: 45, clicks: 234, impressions: 2100, engagement: 11.1 },
  ];

  const handleShare = async (platform: SocialPlatform) => {
    try {
      const shareUrl = platform.shareUrl(customContent);

      // 新しいウィンドウで共有ページを開く
      const shareWindow = window.open(
        shareUrl,
        `share-${platform.id}`,
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );

      // 共有トラッキング（実際のプロダクションでは分析システムに送信）
      console.log('Share tracking:', {
        platform: platform.id,
        content: customContent,
        timestamp: new Date().toISOString(),
      });

      // 共有統計を更新（実際のAPIコール）
      await trackShare(platform.id, customContent);

      toast.success(`${platform.name}で共有しました！`);

      // 5秒後にウィンドウを閉じる（ユーザーが手動で閉じることもある）
      setTimeout(() => {
        if (shareWindow && !shareWindow.closed) {
          shareWindow.close();
        }
      }, 5000);
    } catch (error) {
      console.error('共有エラー:', error);
      toast.error('共有に失敗しました');
    }
  };

  const trackShare = async (platformId: string, content: ShareableContent) => {
    try {
      const response = await fetch('/api/analytics/track-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platformId,
          content,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });

      if (!response.ok) {
        console.warn('共有トラッキングに失敗しました');
      }
    } catch (error) {
      console.warn('共有トラッキングエラー:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${customContent.title}\n\n${customContent.description}\n\n${customContent.url}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('クリップボードにコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
      toast.error('コピーに失敗しました');
    }
  };

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customContent.url)}`;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QRコード - ${customContent.title}</title></head>
          <body style="margin: 20px; text-align: center; font-family: Arial;">
            <h2>${customContent.title}</h2>
            <img src="${qrCodeUrl}" alt="QRコード" style="border: 1px solid #ccc;"/>
            <p>スマートフォンでQRコードをスキャンしてアクセス</p>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="space-y-6">
      {/* シェアボタン群 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            ソーシャルシェア
          </CardTitle>
          <CardDescription>
            Work Time Trackerを友人や同僚にシェアして生産性を向上させましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.id}
                onClick={() => handleShare(platform)}
                className={`${platform.color} text-white flex flex-col items-center gap-2 h-auto py-4`}
                variant="default"
              >
                {platform.icon}
                <span className="text-sm">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* 追加オプション */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              リンクをコピー
            </Button>
            <Button variant="outline" onClick={generateQRCode}>
              <QrCode className="h-4 w-4 mr-2" />
              QRコード生成
            </Button>
            {customizable && (
              <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                カスタマイズ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 共有統計（オプション） */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              シェア統計
            </CardTitle>
            <CardDescription>ソーシャルメディアでの拡散状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockShareStats.map((stat) => (
                <div
                  key={stat.platform}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {socialPlatforms.find((p) => p.name === stat.platform)?.icon}
                    </div>
                    <div>
                      <p className="font-medium">{stat.platform}</p>
                      <p className="text-sm text-gray-600">
                        エンゲージメント率: {stat.engagement}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{stat.shares}</p>
                        <p className="text-gray-600">シェア</p>
                      </div>
                      <div>
                        <p className="font-semibold">{stat.clicks}</p>
                        <p className="text-gray-600">クリック</p>
                      </div>
                      <div>
                        <p className="font-semibold">{stat.impressions.toLocaleString()}</p>
                        <p className="text-gray-600">インプレッション</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* カスタマイズダイアログ */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>シェア内容をカスタマイズ</DialogTitle>
            <DialogDescription>
              共有するメッセージをカスタマイズして、より効果的な拡散を実現しましょう
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <Input
                value={customContent.title}
                onChange={(e) => setCustomContent({ ...customContent, title: e.target.value })}
                placeholder="シェアするタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">説明</label>
              <Textarea
                value={customContent.description}
                onChange={(e) =>
                  setCustomContent({ ...customContent, description: e.target.value })
                }
                placeholder="シェアする説明文"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                value={customContent.url}
                onChange={(e) => setCustomContent({ ...customContent, url: e.target.value })}
                placeholder="シェアするURL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ハッシュタグ（カンマ区切り）</label>
              <Input
                value={customContent.hashtags?.join(',') || ''}
                onChange={(e) =>
                  setCustomContent({
                    ...customContent,
                    hashtags: e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="WorkTimeTracker,生産性,AI,タスク管理"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={() => setIsShareDialogOpen(false)}>設定を保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* シェアのコツ */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            効果的なシェアのコツ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-medium">個人的な体験を追加</h4>
                  <p className="text-sm text-gray-600">
                    「〇〇の改善に役立った」など具体的な体験談を添える
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">ターゲットを明確に</h4>
                  <p className="text-sm text-gray-600">
                    「ADHDの方におすすめ」「チーム管理者向け」など対象を明記
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium">行動喚起を含める</h4>
                  <p className="text-sm text-gray-600">
                    「試してみて」「コメントを聞かせて」など行動を促す
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">適切なタイミング</h4>
                  <p className="text-sm text-gray-600">
                    平日の朝や夕方、日曜の夜など活動が多い時間帯を狙う
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SNSShareComponent;
