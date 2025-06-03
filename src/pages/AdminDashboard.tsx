import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/types/user';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  User as UserIcon,
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onUserUpdate: (user: User) => Promise<void>;
  onUserDelete: (userId: string) => Promise<void>;
  onUserCreate: (user: Omit<User, 'id'>) => Promise<void>;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  trialActivated: boolean;
  trialExpiryDate?: string;
}

const AdminDashboard: React.FC = () => {
  const user = useMemo(
    () => ({
      loginCount: 5,
      subscriptionStatus: 'active',
    }),
    []
  );

  // ユーザー管理のサンプルデータ（実際の実装では API から取得）
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '田中太郎',
      email: 'tanaka@example.com',
      role: 'user',
      isAdmin: false,
      hasActiveSubscription: true,
      trialActivated: false,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      role: 'user',
      isAdmin: false,
      hasActiveSubscription: false,
      trialActivated: true,
      trialExpiryDate: '2024-02-15',
      createdAt: new Date('2024-01-20'),
    },
    {
      id: '3',
      name: '管理者',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: true,
      hasActiveSubscription: true,
      trialActivated: false,
      createdAt: new Date('2024-01-01'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // フィルタリングされたユーザー一覧
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesSubscription =
        subscriptionFilter === 'all' ||
        (subscriptionFilter === 'active' && user.hasActiveSubscription) ||
        (subscriptionFilter === 'trial' && user.trialActivated) ||
        (subscriptionFilter === 'inactive' && !user.hasActiveSubscription && !user.trialActivated);

      return matchesSearch && matchesRole && matchesSubscription;
    });
  }, [users, searchTerm, roleFilter, subscriptionFilter]);

  // ユーザー作成/編集のハンドラー
  const handleUserSubmit = async (formData: UserFormData): Promise<void> => {
    try {
      if (isCreating) {
        const newUser: User = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUsers((prev) => [...prev, newUser]);
      } else if (selectedUser) {
        const updatedUser: User = {
          ...selectedUser,
          ...formData,
          updatedAt: new Date(),
        };
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      }

      setIsUserDialogOpen(false);
      setSelectedUser(null);
      setEditingUser(null);
      setIsCreating(false);
    } catch (error) {
      console.error('ユーザーの保存に失敗しました:', error);
    }
  };

  // ユーザー削除のハンドラー
  const handleUserDelete = async (): Promise<void> => {
    if (selectedUser) {
      try {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('ユーザーの削除に失敗しました:', error);
      }
    }
  };

  // フォームの初期化
  const initializeForm = (user?: User): void => {
    if (user) {
      setEditingUser({
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isAdmin: user.isAdmin || false,
        hasActiveSubscription: user.hasActiveSubscription || false,
        trialActivated: user.trialActivated || false,
        trialExpiryDate: user.trialExpiryDate,
      });
    } else {
      setEditingUser({
        name: '',
        email: '',
        role: 'user',
        isAdmin: false,
        hasActiveSubscription: false,
        trialActivated: false,
      });
    }
  };

  // ユーザー編集ダイアログを開く
  const openEditDialog = (user: User): void => {
    setSelectedUser(user);
    setIsCreating(false);
    initializeForm(user);
    setIsUserDialogOpen(true);
  };

  // 新規作成ダイアログを開く
  const openCreateDialog = (): void => {
    setSelectedUser(null);
    setIsCreating(true);
    initializeForm();
    setIsUserDialogOpen(true);
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (user: User): void => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // サブスクリプション状態のバッジを取得
  const getSubscriptionBadge = (user: User): React.ReactElement => {
    if (user.hasActiveSubscription) {
      return <Badge variant="default">アクティブ</Badge>;
    } else if (user.trialActivated) {
      return <Badge variant="outline">トライアル</Badge>;
    } else {
      return <Badge variant="destructive">未加入</Badge>;
    }
  };

  // 統計情報の計算
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const activeSubscriptions = users.filter((u) => u.hasActiveSubscription).length;
    const trialUsers = users.filter((u) => u.trialActivated).length;
    const adminUsers = users.filter((u) => u.isAdmin).length;

    return {
      totalUsers,
      activeSubscriptions,
      trialUsers,
      adminUsers,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-gray-500">ログイン回数:</span>
                <span>{user.loginCount || 0}回</span>
              </div>
            </div>

            {user.subscriptionStatus && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">サブスクリプション</h4>
                  <Badge
                    variant={
                      user.subscriptionStatus === 'active'
                        ? 'default'
                        : user.subscriptionStatus === 'canceled'
                          ? 'destructive'
                          : 'outline'
                    }
                  >
                    {user.subscriptionStatus === 'active'
                      ? 'アクティブ'
                      : user.subscriptionStatus === 'canceled'
                        ? 'キャンセル済み'
                        : user.subscriptionStatus === 'expired'
                          ? '期限切れ'
                          : 'なし'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー管理</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">アクティブ会員</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.activeSubscriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">トライアル中</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.trialUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">管理者</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.adminUsers}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ユーザー管理</CardTitle>
                  <CardDescription>
                    システムに登録されているユーザーの管理を行います
                  </CardDescription>
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規ユーザー
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="名前またはメールアドレスで検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ロールで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのロール</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="user">一般ユーザー</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="サブスクリプションで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="active">アクティブ</SelectItem>
                    <SelectItem value="trial">トライアル中</SelectItem>
                    <SelectItem value="inactive">未加入</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ユーザー</TableHead>
                      <TableHead>ロール</TableHead>
                      <TableHead>サブスクリプション</TableHead>
                      <TableHead>登録日</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? 'default' : 'outline'}>
                            {user.isAdmin ? '管理者' : '一般ユーザー'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getSubscriptionBadge(user)}</TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('ja-JP')
                            : '不明'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? '新規ユーザー作成' : 'ユーザー編集'}</DialogTitle>
            <DialogDescription>ユーザー情報を入力してください。</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSubmit(editingUser);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">ロール</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({
                      ...editingUser,
                      role: value,
                      isAdmin: value === 'admin',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">一般ユーザー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit">{isCreating ? '作成' : '更新'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  ユーザー「{selectedUser.name}」を削除します。 この操作は元に戻すことができません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleUserDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
