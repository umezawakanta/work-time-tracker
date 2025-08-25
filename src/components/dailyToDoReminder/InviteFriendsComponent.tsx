import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Copy,
  Mail,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Gift,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  ReferralInfo,
  fetchReferralSummary,
  inviteUser,
  claimReferralReward,
} from '@/services/referralService';

interface InviteFriendsProps {
  userName: string;
  isPremium: boolean;
  onUpgrade?: () => void;
}

interface InvitedUser {
  id: string;
  name: string;
  email: string;
  status: 'registered' | 'subscribed' | 'pending';
  joinedAt: Date;
  planType?: string;
}

/**
 * 友達招待コンポーネント
 * リファラルプログラムの管理と友達招待機能を提供
 */
export const InviteFriends: React.FC<InviteFriendsProps> = ({ userName, isPremium, onUpgrade }) => {
  // 状態管理
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [message, setMessage] = useState<string>(
    `${userName}さんから招待が届きました！このタスク管理アプリで生産性が向上します。登録すると、あなたも私も1ヶ月間無料でプレミアム機能が使えます。`
  );
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isClaimingReward, setIsClaimingReward] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('invite');

  // リファラル情報の取得
  useEffect(() => {
    const loadReferralInfo = async () => {
      setLoading(true);
      try {
        const info = await fetchReferralSummary();
        setReferralInfo(info);
      } catch (error) {
        console.error('リファラル情報の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralInfo();
  }, []);

  // リファラルURLのコピー
  const copyReferralUrl = () => {
    if (!referralInfo) return;

    navigator.clipboard
      .writeText(referralInfo.personalUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('URLのコピーに失敗しました:', err);
      });
  };

  // SNSシェアURL生成
  const generateSocialShareUrl = (platform: 'twitter' | 'facebook' | 'linkedin'): string => {
    if (!referralInfo) return '#';

    const text = encodeURIComponent(`${message} ${referralInfo.personalUrl}`);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          referralInfo.personalUrl
        )}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          referralInfo.personalUrl
        )}`;
      default:
        return '#';
    }
  };

  // 友達を招待
  const handleInvite = async () => {
    if (!emailInput.trim()) return;

    const emails = emailInput
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) return;

    setIsInviting(true);
    setInviteResult(null);

    try {
      await inviteUser(emails.join(','), message);

      // Since inviteUser returns void, we'll assume success and create our own result
      setInviteResult({
        success: true,
        message: `${emails.length}人の友達に招待メールを送信しました。`,
      });
      setEmailInput('');

      // リファラル情報を再取得
      const updatedInfo = await fetchReferralSummary();
      setReferralInfo(updatedInfo);
    } catch {
      setInviteResult({
        success: false,
        message: '招待の送信に失敗しました。',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // リファラル報酬を請求
  const handleClaimReward = async () => {
    if (!referralInfo || referralInfo.earnedMonths <= 0) return;

    setIsClaimingReward(true);

    try {
      const result = await claimReferralReward();

      if (result.success) {
        // リファラル情報を再取得して更新
        const updatedInfo = await fetchReferralSummary();
        setReferralInfo(updatedInfo);

        // 成功メッセージを表示
        setInviteResult({
          success: true,
          message: `${result.monthsAdded}ヶ月分のプレミアム期間を追加しました。`,
        });
      } else {
        setInviteResult({
          success: false,
          message: result.error || '報酬の請求に失敗しました。',
        });
      }
    } catch {
      setInviteResult({
        success: false,
        message: '報酬請求中にエラーが発生しました。',
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  // 招待制度の仕組みを説明するコンポーネント
  const HowItWorks = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="how-it-works">
        <AccordionTrigger className="text-sm">招待の仕組み</AccordionTrigger>
        <AccordionContent>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">
                1
              </span>
              <span>あなたの招待リンクを友達に共有します</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">
                2
              </span>
              <span>友達がリンクから登録します</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">
                3
              </span>
              <span>
                友達がプレミアムにアップグレードすると、あなたも友達も1ヶ月間のプレミアム期間を獲得できます
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">
                4
              </span>
              <span>招待できる友達の数に制限はありません</span>
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              友達招待プログラム
            </CardTitle>
            <CardDescription>友達を招待して特典を獲得しましょう</CardDescription>
          </div>

          {referralInfo && referralInfo.earnedMonths > 0 && (
            <Button
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={handleClaimReward}
              disabled={isClaimingReward}
            >
              {isClaimingReward ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Gift className="h-4 w-4 mr-1" />
              )}
              <span>{referralInfo.earnedMonths}ヶ月分の特典を獲得</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {referralInfo ? (
              <>
                {/* リファラル統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">招待した友達</div>
                    <div className="text-2xl font-bold">{referralInfo.totalInvites}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">アップグレードした友達</div>
                    <div className="text-2xl font-bold">{referralInfo.successfulInvites}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">獲得した無料期間</div>
                    <div className="text-2xl font-bold">{referralInfo.earnedMonths}ヶ月</div>
                  </div>
                </div>

                <Tabs defaultValue="invite" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="invite">友達を招待</TabsTrigger>
                    <TabsTrigger value="invites">招待履歴</TabsTrigger>
                  </TabsList>

                  <TabsContent value="invite">
                    <div className="space-y-4">
                      {/* 招待リンク */}
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <label className="text-sm font-medium mb-2 block">
                          あなた専用の招待リンク
                        </label>
                        <div className="flex">
                          <input
                            id="referral-url"
                            type="text"
                            readOnly
                            value={referralInfo.personalUrl}
                            className="flex-1 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 text-sm"
                            aria-label="あなた専用の招待リンク"
                          />
                          <Button className="rounded-l-none" onClick={copyReferralUrl}>
                            {copySuccess ? (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            {copySuccess ? 'コピー済み' : 'コピー'}
                          </Button>
                        </div>
                      </div>

                      {/* ソーシャルシェア */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">SNSで共有</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(generateSocialShareUrl('twitter'), '_blank')}
                          >
                            <Twitter className="h-4 w-4 mr-1 text-blue-400" />
                            Twitter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              window.open(generateSocialShareUrl('facebook'), '_blank')
                            }
                          >
                            <Facebook className="h-4 w-4 mr-1 text-blue-600" />
                            Facebook
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              window.open(generateSocialShareUrl('linkedin'), '_blank')
                            }
                          >
                            <Linkedin className="h-4 w-4 mr-1 text-blue-700" />
                            LinkedIn
                          </Button>
                        </div>
                      </div>

                      {/* メール招待ボタン */}
                      <div className="mt-4">
                        <Button onClick={() => setShowInviteDialog(true)} className="w-full">
                          <Mail className="h-4 w-4 mr-1" />
                          メールで友達を招待
                        </Button>
                      </div>

                      {/* プログレスバー */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">招待特典の進捗状況</span>
                          <span className="text-sm font-medium">
                            {referralInfo.successfulInvites}/5 人
                          </span>
                        </div>
                        <Progress
                          value={Math.min((referralInfo.successfulInvites / 5) * 100, 100)}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          5人の友達がプレミアムにアップグレードすると、3ヶ月間のプレミアム期間をボーナスとして獲得できます！
                        </p>
                      </div>

                      {/* 招待の仕組み */}
                      <HowItWorks />
                    </div>
                  </TabsContent>

                  <TabsContent value="invites">
                    {referralInfo.inviteds.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>名前</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>登録日</TableHead>
                            <TableHead>プラン</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralInfo.inviteds.map((user: InvitedUser) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name || user.email}
                              </TableCell>
                              <TableCell>
                                {user.status === 'subscribed' ? (
                                  <Badge className="bg-green-100 text-green-800 border-0">
                                    プレミアム
                                  </Badge>
                                ) : user.status === 'registered' ? (
                                  <Badge className="bg-blue-100 text-blue-800 border-0">
                                    登録済み
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 border-0">
                                    招待中
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.joinedAt
                                  ? new Date(user.joinedAt).toLocaleDateString('ja-JP')
                                  : '-'}
                              </TableCell>
                              <TableCell>{user.planType || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-1">まだ友達を招待していません</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          友達を招待して、一緒にタスク管理を始めましょう
                        </p>
                        <Button onClick={() => setActiveTab('invite')}>
                          <Share2 className="h-4 w-4 mr-1" />
                          招待を始める
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* 招待結果メッセージ */}
                {inviteResult && (
                  <div
                    className={`mt-4 p-3 rounded-md ${
                      inviteResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start">
                      {inviteResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          inviteResult.success ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {inviteResult.message}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">招待プログラムに参加</h3>
                <p className="text-sm text-gray-500 mb-4">
                  友達を招待して、互いにプレミアム機能を無料で体験しましょう
                </p>
                {isPremium ? (
                  <Button>
                    <Share2 className="h-4 w-4 mr-1" />
                    招待プログラムに参加
                  </Button>
                ) : (
                  <Button onClick={onUpgrade}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    プレミアムにアップグレード
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-gray-500">
          <Gift className="h-3 w-3 inline mr-1" />
          友達を招待するたびに、あなたも友達も特典が得られます
        </p>

        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <a href="/terms/referral" target="_blank" rel="noopener noreferrer">
            適用条件
            <ChevronRight className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardFooter>

      {/* メール招待ダイアログ */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent aria-modal="true" role="dialog">
          <DialogHeader>
            <DialogTitle>メールで友達を招待</DialogTitle>
            <DialogDescription>
              友達のメールアドレスを入力して招待メールを送信しましょう
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-input">友達のメールアドレス</Label>
              <Input
                id="email-input"
                placeholder="複数の場合はカンマで区切ってください"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message-input">カスタムメッセージ (任意)</Label>
              <Textarea
                id="message-input"
                placeholder="友達に送るメッセージをカスタマイズできます"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleInvite} disabled={isInviting || !emailInput.trim()}>
              {isInviting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  招待を送信
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
