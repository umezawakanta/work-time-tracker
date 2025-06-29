import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Copy } from 'lucide-react';

interface ReferralDialogProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  appDomain?: string;
}

/**
 * リファラル（紹介）プログラムのダイアログコンポーネント
 * 友達招待のための紹介コードと共有リンクを表示
 */
export const ReferralDialog: React.FC<ReferralDialogProps> = ({
  isOpen,
  onClose,
  referralCode,
  appDomain = 'yourtaskapp.com',
}) => {
  // コピー成功状態
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 共有リンクの生成
  const shareLink = `https://${appDomain}/signup?ref=${referralCode}`;

  // リファラルコードをコピー
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(referralCode)
      .then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      })
      .catch((err) => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };

  // 共有リンクをコピー
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch((err) => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>友達に紹介してポイントをゲット</DialogTitle>
          <DialogDescription>
            友達がプレミアムにアップグレードすると、あなたも友達も1ヶ月分無料になります。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <label htmlFor="referral-code" className="text-sm font-medium mb-2 block">
              あなたの紹介コード
            </label>
            <div className="flex">
              <input
                id="referral-code"
                type="text"
                readOnly
                value={referralCode}
                aria-label="紹介コード"
                className="flex-1 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 text-sm"
              />
              <Button
                className="rounded-l-none"
                onClick={handleCopyCode}
                aria-label="紹介コードをコピー"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copiedCode ? 'コピー済み' : 'コピー'}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="share-link" className="text-sm font-medium mb-2 block">
              共有リンク
            </label>
            <div className="flex">
              <input
                id="share-link"
                type="text"
                readOnly
                value={shareLink}
                aria-label="共有リンク"
                className="flex-1 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 text-sm"
              />
              <Button
                className="rounded-l-none"
                onClick={handleCopyLink}
                aria-label="共有リンクをコピー"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copiedLink ? 'コピー済み' : 'コピー'}
              </Button>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-amber-800">招待特典</h4>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-amber-700 flex items-start">
                <div className="text-amber-600 mr-2" aria-hidden="true">
                  •
                </div>
                <span>友達が登録すると、あなたも友達も1ヶ月間のプレミアム期間延長</span>
              </li>
              <li className="text-xs text-amber-700 flex items-start">
                <div className="text-amber-600 mr-2" aria-hidden="true">
                  •
                </div>
                <span>招待できる人数に制限はありません</span>
              </li>
              <li className="text-xs text-amber-700 flex items-start">
                <div className="text-amber-600 mr-2" aria-hidden="true">
                  •
                </div>
                <span>友達は初回購入時に10%割引を受けられます</span>
              </li>
            </ul>
          </div>

          {/* ソーシャルシェア機能 */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2 block">SNSで共有</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-[#1DA1F2]"
                onClick={() => {
                  const text = encodeURIComponent(
                    `タスク管理アプリで生産性向上！あなたとわたしにプレミアム特典付き ${shareLink}`
                  );
                  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                }}
                aria-label="Twitterで共有"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-[#1877F2]"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
                    '_blank'
                  );
                }}
                aria-label="Facebookで共有"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-[#0A66C2]"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
                    '_blank'
                  );
                }}
                aria-label="LinkedInで共有"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
