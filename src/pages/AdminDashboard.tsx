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
import { Product, Order, ProductCategory, StoreSettings } from '@/types/ecommerce';
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
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Star,
  BarChart3,
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

  // ECサイト関連の状態
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'プレミアム ワイヤレスヘッドフォン',
      description: '高音質でノイズキャンセリング機能付きのワイヤレスヘッドフォンです。',
      shortDescription: '高音質ノイズキャンセリングヘッドフォン',
      price: 29800,
      salePrice: 24800,
      images: [
        {
          id: '1',
          url: '/images/headphones-1.jpg',
          alt: 'ヘッドフォン正面',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
      tags: ['ワイヤレス', 'ノイズキャンセリング', 'プレミアム'],
      sku: 'HP001',
      stock: 45,
      isActive: true,
      attributes: [],
      ratings: [],
      averageRating: 4.5,
      reviewCount: 128,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'スマートウォッチ Pro',
      description: '健康管理とフィットネス追跡機能を備えたスマートウォッチです。',
      shortDescription: '多機能スマートウォッチ',
      price: 39800,
      images: [
        {
          id: '2',
          url: '/images/smartwatch-1.jpg',
          alt: 'スマートウォッチ',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
      tags: ['スマートウォッチ', 'フィットネス', 'ヘルスケア'],
      sku: 'SW001',
      stock: 32,
      isActive: true,
      attributes: [],
      ratings: [],
      averageRating: 4.2,
      reviewCount: 89,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      userId: '1',
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'プレミアム ワイヤレスヘッドフォン',
          productImage: '/images/headphones-1.jpg',
          price: 24800,
          quantity: 1,
          total: 24800,
        },
      ],
      shippingAddress: {
        firstName: '田中',
        lastName: '太郎',
        address1: '東京都渋谷区1-1-1',
        city: '渋谷区',
        state: '東京都',
        postalCode: '150-0001',
        country: '日本',
      },
      billingAddress: {
        firstName: '田中',
        lastName: '太郎',
        address1: '東京都渋谷区1-1-1',
        city: '渋谷区',
        state: '東京都',
        postalCode: '150-0001',
        country: '日本',
      },
      paymentMethod: {
        type: 'credit_card',
        lastFour: '4242',
        cardholderName: '田中太郎',
      },
      subtotal: 24800,
      tax: 2480,
      shipping: 500,
      discount: 0,
      total: 27780,
      currency: 'JPY',
      status: 'confirmed',
      paymentStatus: 'paid',
      shippingStatus: 'processing',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
    },
  ]);

  const [categories, setCategories] = useState<ProductCategory[]>([
    { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
    { id: '2', name: '食品・飲料', slug: 'food-drink', isActive: true, order: 2 },
    { id: '3', name: 'ファッション', slug: 'fashion', isActive: true, order: 3 },
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

  // ECサイト統計の計算
  const ecommerceStats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      averageOrderValue,
    };
  }, [products, orders]);

  // 価格フォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 注文ステータスのバッジ
  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, label: '保留中', icon: Clock },
      confirmed: { variant: 'default' as const, label: '確認済み', icon: CheckCircle },
      processing: { variant: 'secondary' as const, label: '処理中', icon: Package },
      shipped: { variant: 'default' as const, label: '発送済み', icon: Truck },
      delivered: { variant: 'default' as const, label: '配送完了', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'キャンセル', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー管理</TabsTrigger>
          <TabsTrigger value="ecommerce">ECサイト</TabsTrigger>
          <TabsTrigger value="orders">注文管理</TabsTrigger>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(ecommerceStats.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">注文数</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ecommerceStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  保留中: {ecommerceStats.pendingOrders}件
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">商品数</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ecommerceStats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  在庫少: {ecommerceStats.lowStockProducts}件
                </p>
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

        <TabsContent value="ecommerce" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">アクティブ商品</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ecommerceStats.activeProducts}</div>
                <p className="text-xs text-muted-foreground">
                  全{ecommerceStats.totalProducts}件中
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">在庫少商品</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {ecommerceStats.lowStockProducts}
                </div>
                <p className="text-xs text-muted-foreground">要補充</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均注文額</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(ecommerceStats.averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground">前月比 +5%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">カテゴリ数</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">アクティブカテゴリ</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>商品管理</CardTitle>
                  <CardDescription>商品の追加、編集、削除を行います</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新商品追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="商品名で検索" className="pl-8" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのカテゴリ</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead>価格</TableHead>
                        <TableHead>在庫</TableHead>
                        <TableHead>評価</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  SKU: {product.sku}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              {product.salePrice && (
                                <div className="text-sm text-red-600 font-medium">
                                  {formatPrice(product.salePrice)}
                                </div>
                              )}
                              <div
                                className={
                                  product.salePrice ? 'text-sm text-gray-500 line-through' : ''
                                }
                              >
                                {formatPrice(product.price)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`font-medium ${product.stock < 10 ? 'text-orange-600' : product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {product.stock}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{product.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? 'default' : 'secondary'}>
                              {product.isActive ? 'アクティブ' : '非アクティブ'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>注文管理</CardTitle>
                  <CardDescription>注文の確認、更新、管理を行います</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="注文番号またはユーザー名で検索" className="pl-8" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのステータス</SelectItem>
                      <SelectItem value="pending">保留中</SelectItem>
                      <SelectItem value="confirmed">確認済み</SelectItem>
                      <SelectItem value="processing">処理中</SelectItem>
                      <SelectItem value="shipped">発送済み</SelectItem>
                      <SelectItem value="delivered">配送完了</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>注文番号</TableHead>
                        <TableHead>顧客情報</TableHead>
                        <TableHead>商品</TableHead>
                        <TableHead>金額</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>注文日</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.map((item) => (
                                <div key={item.id} className="text-sm">
                                  {item.productName} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatPrice(order.total)}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.paymentMethod.type === 'credit_card' ? 'カード' : '銀行振込'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getOrderStatusBadge(order.status)}
                              <div className="text-xs text-muted-foreground">
                                配送: {order.shippingStatus}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
