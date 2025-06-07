import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { promoteToAdmin } from '@/services/api/authApi';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  User as UserIcon,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Activity,
  Globe,
  LogOut,
  AlertCircle,
} from 'lucide-react';

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  isCurrent: boolean;
}

// モックセッションデータ
const mockSessions: LoginSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: '東京, 日本',
    ipAddress: '192.168.1.100',
    lastActivity: '現在',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: '東京, 日本',
    ipAddress: '192.168.1.101',
    lastActivity: '2時間前',
    isCurrent: false,
  },
];

export default function UserProfile() {
  const { user, fetchUser, updateProfile } = useAuth();
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // セキュリティ設定用の状態
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sessions, setSessions] = useState<LoginSession[]>(mockSessions);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        await fetchUser();
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('ユーザー情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      loadUserData();
    }
  }, [fetchUser, user]);

  useEffect(() => {
    if (user) {
      setFormName(user.name || '');
      setFormEmail(user.email || '');
    }
  }, [user]);

  // パスワード強度チェック
  const checkPasswordStrength = (password: string): number => {
    if (password.length === 0) return 0;

    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    return Math.min(score, 100);
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(passwordForm.newPassword));
  }, [passwordForm.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({ name: formName, email: formEmail });
      toast.success('プロフィールが更新されました');
      await fetchUser(); // プロフィール更新後に最新のユーザー情報を取得
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }

    if (passwordStrength < 60) {
      toast.error('パスワードが弱すぎます。より強力なパスワードを設定してください');
      return;
    }

    if (passwordForm.currentPassword.length < 6) {
      toast.error('現在のパスワードを入力してください');
      return;
    }

    try {
      // changePassword API を使用
      const { changePassword } = await import('@/services/api/authApi');
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('パスワードを変更しました');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      console.error('Password change error:', error);
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse.response?.status === 401) {
        toast.error('現在のパスワードが正しくありません');
      } else if (errorResponse.response?.status === 422) {
        toast.error('新しいパスワードが要件を満たしていません');
      } else {
        toast.error('パスワードの変更に失敗しました');
      }
    }
  };

  // セッション終了
  const handleTerminateSession = async (sessionId: string) => {
    try {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('セッションを終了しました');
    } catch {
      toast.error('セッションの終了に失敗しました');
    }
  };

  // 全セッション終了
  const handleTerminateAllSessions = async () => {
    try {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success('他のすべてのセッションを終了しました');
    } catch {
      toast.error('セッションの終了に失敗しました');
    }
  };

  const handlePromoteToAdmin = async () => {
    setIsPromoting(true);
    try {
      console.log('現在のユーザー状態:', user);
      const response = await promoteToAdmin();
      console.log('管理者権限付与レスポンス:', response);

      // fetchUser()を先に呼び出して最新のユーザー情報を取得
      await fetchUser();

      toast.success('管理者権限を付与しました');
    } catch (error) {
      console.error('Admin promotion error:', error);
      toast.error('権限の付与に失敗しました');
    } finally {
      setIsPromoting(false);
    }
  };

  const _getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return '弱い';
    if (strength < 70) return '普通';
    return '強い';
  };

  if (isLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserIcon className="h-6 w-6" />
            ユーザープロフィール
            {user?.isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                管理者
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">アカウント情報とセキュリティ設定を管理します</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              プロフィール
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              セキュリティ
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              セッション
            </TabsTrigger>
          </TabsList>

          {/* プロフィールタブ */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>あなたの基本情報を表示・更新します</CardDescription>
                {/* デバッグ情報を表示 */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-2">
                    Debug: isAdmin = {String(user?.isAdmin)}, userId = {user?._id || user?.id}
                  </div>
                )}
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* 権限レベル表示 */}
                  <div className="space-y-2">
                    <Label>権限レベル</Label>
                    <div className="p-3 bg-muted rounded-md">
                      {user?.isAdmin ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Crown className="h-4 w-4" />
                          <span className="font-medium">管理者権限</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserIcon className="h-4 w-4" />
                          <span className="font-medium">一般ユーザー</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">名前</Label>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="名前を入力してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      placeholder="メールアドレスを入力してください"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '更新中...' : '更新'}
                  </Button>
                  {!user?.isAdmin && (
                    <Button
                      type="button"
                      onClick={handlePromoteToAdmin}
                      variant="destructive"
                      className="w-full"
                      disabled={isPromoting}
                    >
                      {isPromoting ? '権限付与中...' : '管理者権限を付与（開発用）'}
                    </Button>
                  )}
                  {user?.isAdmin && (
                    <div className="text-center text-sm text-green-600 font-medium">
                      ✓ 管理者権限が付与されています
                    </div>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* セキュリティタブ */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  パスワード変更
                </CardTitle>
                <CardDescription>
                  定期的なパスワード変更でアカウントのセキュリティを向上させましょう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {/* 現在のパスワード */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">現在のパスワード</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        className="pr-10"
                        placeholder="現在のパスワードを入力"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 新しいパスワード */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新しいパスワード</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        className="pr-10"
                        placeholder="新しいパスワードを入力"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* パスワード強度 */}
                    {passwordForm.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>パスワード強度:</span>
                          <span
                            className={`font-medium ${
                              passwordStrength < 40
                                ? 'text-red-600'
                                : passwordStrength < 70
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className={`h-2`} />
                        {passwordStrength < 60 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              8文字以上で大文字・小文字・数字・記号を含めてください
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>

                  {/* パスワード確認 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        className="pr-10"
                        placeholder="パスワードを再入力"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    パスワードを変更
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* セッション管理タブ */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    アクティブセッション
                  </div>
                  <Button variant="outline" size="sm" onClick={handleTerminateAllSessions}>
                    <LogOut className="h-4 w-4 mr-2" />
                    他を全て終了
                  </Button>
                </CardTitle>
                <CardDescription>
                  現在ログインしているデバイスとセッションを管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{session.device}</span>
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              現在のセッション
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{session.location}</p>
                        <p className="text-xs text-gray-500">
                          IP: {session.ipAddress} • 最終アクティビティ: {session.lastActivity}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          終了
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
