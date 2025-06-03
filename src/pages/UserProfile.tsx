import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { promoteToAdmin } from '@/services/api/authApi';
import { Badge } from '@/components/ui/badge';
import { Crown, User as UserIcon } from 'lucide-react';

export default function UserProfile() {
  const { user, fetchUser, updateProfile, setUser } = useAuth();
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

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

  const handlePromoteToAdmin = async () => {
    setIsPromoting(true);
    try {
      console.log('現在のユーザー状態:', user);
      const response = await promoteToAdmin();
      console.log('管理者権限付与レスポンス:', response);

      setUser(response);
      toast.success('管理者権限を付与しました');

      // 最新の情報を取得して状態を同期
      await fetchUser();

      // デバッグ: 更新後のユーザー状態を確認
      console.log('権限付与後のユーザー状態:', response);
    } catch (error) {
      console.error('Admin promotion error:', error);
      toast.error('権限の付与に失敗しました');
    } finally {
      setIsPromoting(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ユーザープロフィール
            {user?.isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                管理者
              </Badge>
            )}
            {!user?.isAdmin && (
              <Badge variant="outline" className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                一般ユーザー
              </Badge>
            )}
          </CardTitle>
          <CardDescription>あなたの情報を表示・更新します</CardDescription>
          {/* デバッグ情報を表示 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2">
              Debug: isAdmin = {String(user?.isAdmin)}, userId = {user?.id}
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
    </div>
  );
}
