import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import { Locale } from "@/context/LocaleContext";
import {
  Home,
  Clock,
  BarChart2,
  CreditCard,
  Calendar,
  Vote,
  LogIn,
  LogOut,
  BookOpen,
  Moon,
  Menu,
  X,
  Pen,
  User,
  GitBranch,
  AlertCircle,
  Guitar,
  Crown,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { logout } from "@/services/api/authApi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserNotification } from "@/types";
import userSubscriptionApi from "@/services/api/userSubscriptionApi";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isPremium?: boolean;
  badge?: string;
  description?: string;
}

export default function Layout({ children }: LayoutProps) {
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setIsAuthenticated, user, fetchUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubscriptionChecking, setIsSubscriptionChecking] = useState(true);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // ユーザー情報の取得
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  // サブスクリプション状態の取得
  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          setIsSubscriptionChecking(true);
          const response = await userSubscriptionApi.getUserSubscription(user.id);
          const subscription = response.data; // Axiosレスポンスからデータを取得

          // subscriptionがnullでない場合のみ比較を行う
          setIsPremium(
            subscription !== null &&
              subscription.status === "active" &&
              subscription.planId !== "free"
          );
        } catch (error) {
          console.error("サブスクリプション確認エラー:", error);
          // エラー時はプレミアム機能を無効化
          setIsPremium(false);
        } finally {
          setIsSubscriptionChecking(false);
        }
      } else {
        setIsPremium(false);
        setIsSubscriptionChecking(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user]);

  // 通知の取得
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user) {
        try {
          // 本番環境ではAPIから通知を取得
          // const response = await getNotifications(user.id);
          // setNotifications(response.data);

          // モックデータ（本番環境では削除）
          const mockNotifications = [
            {
              id: 1,
              title: "作業時間の記録を忘れています",
              message:
                "昨日の作業時間が記録されていません。記録を忘れていませんか？",
              read: false,
              type: "reminder",
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              title: "週間レポートが生成されました",
              message:
                "先週の作業時間レポートが生成されました。確認してみましょう。",
              read: true,
              type: "report",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          setNotifications(mockNotifications);
          setUnreadNotifications(
            mockNotifications.filter((n) => !n.read).length
          );
        } catch (error) {
          console.error("通知取得エラー:", error);
          setNotifications([]);
          setUnreadNotifications(0);
        }
      } else {
        setNotifications([]);
        setUnreadNotifications(0);
      }
    };

    fetchNotifications();

    // 定期的に通知を更新（本番環境では実装）
    const intervalId = setInterval(fetchNotifications, 300000); // 5分ごとに更新

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user]);

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
    toast.success(
      `言語を${value === "ja-JP" ? "日本語" : "English"}に変更しました`
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      toast.success("ログアウトしました");
      navigate("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  const handleNotificationRead = async (notificationId: number) => {
    try {
      // 本番環境ではAPI呼び出し
      // await markNotificationAsRead(notificationId);

      // モックの処理（本番環境では削除）
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("通知既読エラー:", error);
    }
  };

  const handleAllNotificationsRead = async () => {
    try {
      // 本番環境ではAPI呼び出し
      // await markAllNotificationsAsRead(user.id);

      // モックの処理（本番環境では削除）
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error("全通知既読エラー:", error);
    }
  };

  // メニュー項目の定義
  const frequentMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: <Clock size={18} />,
        label: "作業時間入力",
        path: "/work-time",
        description: "作業時間を記録します",
      },
      {
        icon: <BarChart2 size={18} />,
        label: "作業時間レポート",
        path: "/work-time-reports",
        description: "作業時間の分析レポートを表示します",
      },
      {
        icon: <BarChart2 size={18} />,
        label: "資産/負債",
        path: "/asset-liability-report",
        isPremium: false,
        description: "資産と負債の状況を管理します",
      },
      {
        icon: <Calendar size={18} />,
        label: "資産カレンダー",
        path: "/asset-calendar",
        isPremium: false,
        description: "資産の増減をカレンダーで管理します",
      },
      {
        icon: <CreditCard size={18} />,
        label: "サブスク管理",
        path: "/subscription-management",
        description: "サブスクリプション設定を管理します",
      },
      {
        icon: <Moon size={18} />,
        label: "睡眠",
        path: "/sleep-tracker",
        isPremium: true,
        description: "睡眠の質を記録・分析します",
      },
      {
        icon: <BookOpen size={18} />,
        label: "本棚",
        path: "/bookshelf",
        description: "読んだ本を管理します",
      },
      {
        icon: <Guitar size={18} />,
        label: "ギター練習",
        path: "/guitar-practice",
        isPremium: true,
        description: "ギター練習の記録と進捗管理",
      },
      {
        icon: <Pen size={18} />,
        label: "ブログ",
        path: "/blog",
        description: "ブログを書いて共有します",
      },
      {
        icon: <BookOpen size={18} />,
        label: "ADHD日記",
        path: "/diary",
        isPremium: true,
        description: "ADHD症状の記録と管理",
      },
      {
        icon: <AlertCircle size={18} />,
        label: "衝動トラッカー",
        path: "/impulse-tracker",
        isPremium: true,
        description: "衝動的な行動を記録して改善します",
      },
    ],
    []
  );

  const otherMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: <Home size={18} />,
        label: "ホーム",
        path: "/",
        description: "ダッシュボードを表示します",
      },
      {
        icon: <Vote size={18} />,
        label: "選挙候補者",
        path: "/election-candidates",
        description: "選挙候補者の情報を表示します",
      },
      {
        icon: <User size={18} />,
        label: "プロフィール",
        path: "/profile",
        description: "ユーザープロフィールを編集します",
      },
      {
        icon: <GitBranch size={18} />,
        label: "WBS作成ツール",
        path: "/wbs-creator",
        isPremium: true,
        description: "Work Breakdown Structureを作成します",
      },
      {
        icon: <BarChart2 size={18} />,
        label: "政党支持率",
        path: "/political-trends",
        description: "政党支持率のトレンドを表示します",
      },
      {
        icon: <Calendar size={18} />,
        label: "カレンダー",
        path: "/calendar",
        description: "イベントカレンダーを表示します",
      },
      {
        icon: <HelpCircle size={18} />,
        label: "ヘルプ",
        path: "/help",
        description: "使い方ガイドとよくある質問",
      },
    ],
    []
  );

  // 現在のパスがアクティブかどうかをチェック
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // メニュー項目のレンダリング（プレミアム対応）
  const renderMenuItem = (item: MenuItem, mobile: boolean = false) => {
    const isItemActive = isActive(item.path);
    const isPremiumItem = item.isPremium && !isSubscriptionChecking;
    const needsUpgrade = isPremiumItem && !isPremium;

    const linkClasses = cn(
      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
      mobile ? "text-base" : "text-sm",
      isItemActive
        ? "bg-primary/10 text-primary"
        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
      needsUpgrade && "opacity-60"
    );

    const content = (
      <>
        {item.icon}
        <span className="ml-2">{item.label}</span>
        {isPremiumItem && <Crown size={14} className="ml-1 text-amber-500" />}
        {item.badge && (
          <Badge variant="secondary" className="ml-2">
            {item.badge}
          </Badge>
        )}
      </>
    );

    // プレミアム機能へのアクセス制御
    if (needsUpgrade) {
      return (
        <TooltipProvider key={item.path}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={linkClasses}
                onClick={() => {
                  toast.error("この機能はプレミアムプラン限定です");
                  navigate("/subscription-management");
                }}
              >
                {content}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>プレミアムプラン限定機能です</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.path}
              className={linkClasses}
              onClick={() => mobile && setIsMenuOpen(false)}
            >
              {content}
            </Link>
          </TooltipTrigger>
          {item.description && (
            <TooltipContent>
              <p>{item.description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="text-2xl font-bold text-primary">
              <div className="flex flex-col items-center">
                <span>作業時間</span>
                <span>トラッカー</span>
                {isPremium && (
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                  >
                    プレミアム
                  </Badge>
                )}
              </div>
            </Link>

            {/* モバイルメニュートグル */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* 通知ボタン */}
              {isAuthenticated && (
                <Sheet
                  open={isNotificationOpen}
                  onOpenChange={setIsNotificationOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell size={20} />
                      {unreadNotifications > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          variant="destructive"
                        >
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader className="border-b pb-4 mb-4">
                      <SheetTitle className="text-left flex justify-between items-center">
                        <span>通知</span>
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAllNotificationsRead}
                          >
                            すべて既読
                          </Button>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          通知はありません
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              notification.read
                                ? "bg-white"
                                : "bg-blue-50 border-blue-200"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  notification.timestamp
                                ).toLocaleDateString("ja-JP")}
                              </p>
                            </div>
                            <p className="text-sm mt-1">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() =>
                                  handleNotificationRead(notification.id)
                                }
                              >
                                既読にする
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* 言語切替ボタン */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {locale === "ja-JP" ? "日本語" : "English"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLocaleChange("ja-JP")}>
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLocaleChange("en-US")}>
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ユーザー認証状態 */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/default-avatar.png" // サーバー上のデフォルトアバター画像へのパス
                          alt={user?.name || ""}
                        />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {user?.name || "読み込み中..."}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>アカウント</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>プロフィール</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/subscription-management")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>サブスクリプション</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>設定</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  onClick={() => navigate("/login")}
                  className="flex items-center"
                >
                  <LogIn size={18} className="mr-2" />
                  <span>ログイン</span>
                </Button>
              )}
            </nav>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex justify-between items-center overflow-x-auto">
            <nav className="flex space-x-1 py-1">
              {frequentMenuItems
                .slice(0, 7)
                .map((item) => renderMenuItem(item))}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">その他のメニュー</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>よく使う機能</DropdownMenuLabel>
                  {frequentMenuItems.slice(7).map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      disabled={item.isPremium && !isPremium}
                      onClick={() => {
                        if (item.isPremium && !isPremium) {
                          toast.error("この機能はプレミアムプラン限定です");
                          navigate("/subscription-management");
                          return;
                        }
                        navigate(item.path);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.isPremium && (
                        <Crown size={14} className="ml-1 text-amber-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>その他の機能</DropdownMenuLabel>
                  {otherMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      disabled={item.isPremium && !isPremium}
                      onClick={() => {
                        if (item.isPremium && !isPremium) {
                          toast.error("この機能はプレミアムプラン限定です");
                          navigate("/subscription-management");
                          return;
                        }
                        navigate(item.path);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.isPremium && (
                        <Crown size={14} className="ml-1 text-amber-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated && (
                <div className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/default-avatar.png" // サーバー上のデフォルトアバター画像へのパス
                        alt={user?.name || ""}
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">
                        {user?.name || "読み込み中..."}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                          <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            variant="destructive"
                          >
                            {unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader className="border-b pb-4 mb-4">
                        <SheetTitle className="text-left flex justify-between items-center">
                          <span>通知</span>
                          {notifications.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleAllNotificationsRead}
                            >
                              すべて既読
                            </Button>
                          )}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">
                            通知はありません
                          </p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-3 rounded-lg border",
                                notification.read
                                  ? "bg-white"
                                  : "bg-blue-50 border-blue-200"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleDateString("ja-JP")}
                                </p>
                              </div>
                              <p className="text-sm mt-1">
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() =>
                                    handleNotificationRead(notification.id)
                                  }
                                >
                                  既読にする
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              <div className="font-medium px-3 pt-3 pb-1">よく使う機能</div>
              {frequentMenuItems.map((item) => renderMenuItem(item, true))}

              <div className="font-medium px-3 pt-3 pb-1 mt-4">
                その他の機能
              </div>
              {otherMenuItems.map((item) => renderMenuItem(item, true))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    {locale === "ja-JP" ? "日本語" : "English"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLocaleChange("ja-JP")}>
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLocaleChange("en-US")}>
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/profile")}
                    className="w-full justify-start flex items-center px-3 py-2"
                  >
                    <User size={18} />
                    <span className="ml-2">プロフィール設定</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/subscription-management")}
                    className="w-full justify-start flex items-center px-3 py-2"
                  >
                    <CreditCard size={18} />
                    <span className="ml-2">サブスクリプション管理</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start flex items-center px-3 py-2"
                  >
                    <LogOut size={18} />
                    <span className="ml-2">ログアウト</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={() => navigate("/login")}
                  className="w-full mt-2"
                >
                  <LogIn size={18} className="mr-2" />
                  <span>ログイン</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {!isAuthenticated &&
          location.pathname !== "/login" &&
          location.pathname !== "/register" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    より多くの機能を利用するには
                    <Link
                      to="/login"
                      className="font-medium underline text-blue-700 hover:text-blue-600 mx-1"
                    >
                      ログイン
                    </Link>
                    または
                    <Link
                      to="/register"
                      className="font-medium underline text-blue-700 hover:text-blue-600 mx-1"
                    >
                      新規登録
                    </Link>
                    してください。
                  </p>
                </div>
              </div>
            </div>
          )}

        {isAuthenticated && !isPremium && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md hidden md:block">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    プレミアムプランにアップグレードして、すべての機能をご利用いただけます。
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={() => navigate("/subscription-management")}
              >
                詳細を見る
              </Button>
            </div>
          </div>
        )}

        {children}
      </main>

      <footer className="bg-gray-100 text-gray-600 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">作業時間トラッカー</h3>
              <p className="text-sm">
                あなたの生産性向上をサポートする最高のツールです。作業時間の記録、分析、改善を一つのアプリで実現しましょう。
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-3">機能</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/work-time" className="hover:underline">
                    作業時間記録
                  </Link>
                </li>
                <li>
                  <Link to="/work-time-reports" className="hover:underline">
                    レポート分析
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subscription-management"
                    className="hover:underline"
                  >
                    サブスクリプション
                  </Link>
                </li>
                <li>
                  <Link
                    to="/asset-liability-report"
                    className="hover:underline"
                  >
                    資産管理
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold mb-3">サポート</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/help" className="hover:underline">
                    ヘルプセンター
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:underline">
                    よくある質問
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:underline">
                    フィードバック
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold mb-3">法的情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="hover:underline">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:underline">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:underline">
                    Cookie ポリシー
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm">
              &copy; {new Date().getFullYear()} 作業時間トラッカー. All rights
              reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="sr-only">Facebook</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="sr-only">Instagram</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
