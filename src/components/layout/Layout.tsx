import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { Locale } from '@/context/LocaleContext';
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
  CheckCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react';
import { logout } from '@/services/api/authApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { UserNotification } from '@/types';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import notificationApi from '@/services/api/notificationApi';
import NotificationItem from '@/components/notifications/NotificationItem';
import axios, { AxiosError } from 'axios';

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
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

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
          try {
            // サブスクリプション情報の取得を試みる
            const response = await userSubscriptionApi.getUserSubscription(user.id);
            const subscription = response.data;

            setIsPremium(
              subscription && subscription.status === 'active' && subscription.planId !== 'free'
            );
          } catch (unknownError) {
            // エラーをタイプセーフに処理
            const error = unknownError as AxiosError;

            // 404エラーの場合、デフォルトのサブスクリプション情報を作成
            if (error.response?.status === 404) {
              console.log('サブスクリプション情報がないため、デフォルト情報を作成します');

              try {
                // デフォルトのフリープランを作成
                const subscriptionData = {
                  userId: user.id,
                  planId: 'free',
                  status: 'active' as const, // const assertionを使用
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
                  cancelAtPeriodEnd: false,
                };

                console.log('作成するサブスクリプションデータ:', subscriptionData);
                const createResponse =
                  await userSubscriptionApi.createUserSubscription(subscriptionData);
                console.log('サブスクリプション作成成功:', createResponse);

                // プレミアムではない状態に設定
                setIsPremium(false);
              } catch (unknownCreateError) {
                // 型ガードを使用してAxiosErrorかどうかを確認
                if (axios.isAxiosError(unknownCreateError)) {
                  const createError = unknownCreateError; // 自動的にAxiosError型になる
                  console.error('サブスクリプション作成エラー:', createError);

                  // エラーメッセージをより詳細に表示
                  if (createError.response) {
                    console.error('エラーレスポンス:', createError.response.data);
                  }
                } else {
                  // AxiosError以外のエラー
                  console.error('サブスクリプション作成エラー:', unknownCreateError);
                }

                setIsPremium(false);
              }
            } else {
              console.error('サブスクリプション確認エラー:', error);
              if (error.response) {
                console.error('エラーレスポンス:', error.response.data);
              }
              setIsPremium(false);
            }
          }
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

  // 通知取得の関数
  // 通知取得の関数
  const fetchNotifications = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        setIsLoadingNotifications(true);

        // 通知一覧を取得
        const response = await notificationApi.getUserNotifications(user.id);
        setNotifications(response.data);

        // 未読通知数を取得
        const unreadResponse = await notificationApi.getUnreadNotificationsCount(user.id);
        setUnreadNotifications(unreadResponse.data.count);
      } catch (error) {
        console.error('通知取得エラー:', error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // 通知がまだ存在しない場合は空の配列を設定
          setNotifications([]);
          setUnreadNotifications(0);
        } else {
          // その他のエラーの場合はトースト表示
          toast.error('通知の取得に失敗しました');
        }
      } finally {
        setIsLoadingNotifications(false);
      }
    } else {
      setNotifications([]);
      setUnreadNotifications(0);
    }
  }, [isAuthenticated, user]);

  // Layoutコンポーネント内、useEffectの外で定義
  const handleApiError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response?.status === 500) {
        const errorMessage = axiosError.response.data.message || axiosError.message;
        if (errorMessage.includes('MongoDB connection error')) {
          console.error('[API] MongoDB接続エラー検出');

          // オフラインモードの通知
          toast.error('データベース接続エラー: 一部の機能が制限されています', {
            id: 'mongodb-connection-error',
            duration: 10000,
          });
        }
      }
    }
  }, []);

  // 通知の取得
  useEffect(() => {
    fetchNotifications();

    // WebSocketを使用したリアルタイム通知の実装
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3秒
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isOfflineMode = false; // オフラインモードフラグ

    // WebSocket接続関数
    const connectWebSocket = () => {
      try {
        // サーバーのURLを環境に応じて設定
        // 本番環境ではVercelのドメインを、開発環境ではlocalhostを使用
        let wsUrl = '';
        const apiDomain = window.location.hostname;

        if (apiDomain === 'localhost') {
          wsUrl = 'ws://localhost:3001';
        } else {
          // Vercel上で動作している場合、同じドメインでWebSocketも提供
          wsUrl = `wss://${apiDomain}`;
        }

        console.log('[WebSocket] 接続試行:', wsUrl);

        // WebSocketの接続
        ws = new WebSocket(`${wsUrl}/notifications`);

        // 型ガードの一環として、wsがnullでないことを確認
        if (ws) {
          // 接続タイムアウト処理（5秒後にタイムアウト）
          const connectionTimeout = setTimeout(() => {
            if (ws && ws.readyState !== WebSocket.OPEN) {
              console.log('[WebSocket] 接続タイムアウト');
              ws.close();
              // タイムアウトした場合も再接続を試みる
              attemptReconnect();
            }
          }, 5000);

          ws.onopen = () => {
            console.log('[WebSocket] 接続が確立されました');
            // タイムアウトタイマーをクリア
            clearTimeout(connectionTimeout);
            // 接続成功したらリトライカウントをリセット
            reconnectAttempts = 0;
            // オフラインモードフラグをリセット
            if (isOfflineMode) {
              isOfflineMode = false;
              toast.success('通知サーバーに再接続しました', {
                id: 'websocket-reconnected',
                duration: 3000,
              });
            }

            if (ws) {
              // 認証情報を送信
              const token = localStorage.getItem('token');
              if (!token) {
                console.error('[WebSocket] 認証トークンが見つかりません');
                return;
              }

              console.log('[WebSocket] 認証情報を送信します - ユーザーID:', user?.id);
              ws.send(
                JSON.stringify({
                  type: 'auth',
                  userId: user?.id,
                  token: token,
                })
              );
            }
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('[WebSocket] メッセージを受信:', data.type);

              if (data.type === 'auth_success') {
                console.log('[WebSocket] 認証に成功しました');
              } else if (data.type === 'error') {
                console.error('[WebSocket] エラーメッセージを受信:', data.message);

                // 認証エラーの場合はトークンの更新を試みる
                if (
                  data.message.includes('無効な認証情報') ||
                  data.message.includes('無効なトークン') ||
                  data.message.includes('jwt expired')
                ) {
                  console.log('[WebSocket] トークンエラーのため再認証が必要です');

                  // 自動的にユーザーを再認証させる（オプション）
                  toast.error('セッションの有効期限が切れました。再ログインしてください。', {
                    duration: 5000,
                    id: 'session-expired',
                  });

                  // ログイン画面にリダイレクト
                  setTimeout(() => {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    navigate('/login');
                  }, 2000);
                }
              } else if (data.type === 'notification') {
                // 新しい通知を受信した場合
                const newNotification = data.notification;
                console.log('[WebSocket] 新しい通知を受信:', newNotification.title);

                // 通知リストに追加
                setNotifications((prev) => [newNotification, ...prev]);

                // 未読通知数を更新
                setUnreadNotifications((prev) => prev + 1);

                // トースト通知を表示
                toast.custom(
                  (t) => (
                    <div
                      className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="flex-1 p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            {getNotificationTypeIcon(newNotification.type)}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {newNotification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">{newNotification.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex border-l border-gray-200">
                        <button
                          onClick={() => {
                            toast.dismiss(t.id);
                            handleNotificationRead(newNotification.id);
                          }}
                          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          既読にする
                        </button>
                      </div>
                    </div>
                  ),
                  { duration: 5000 }
                );
              }
            } catch (error) {
              console.error('[WebSocket] メッセージの処理エラー:', error);
            }
          };

          ws.onerror = (error) => {
            // タイムアウトタイマーをクリア
            clearTimeout(connectionTimeout);
            console.error('[WebSocket] エラーが発生しました:', error);
          };

          ws.onclose = (event) => {
            // タイムアウトタイマーをクリア
            clearTimeout(connectionTimeout);

            console.log(
              `[WebSocket] 接続が閉じられました: コード=${event.code}, 理由=${
                event.reason || '理由なし'
              }`
            );

            // コード1006は異常終了（サーバーに到達できない）
            if (event.code === 1006) {
              console.log(
                '[WebSocket] サーバーに到達できません。MongoDB接続が原因の可能性があります。'
              );
            }

            // 初回の接続失敗の場合はサイレントに、それ以外は通知
            if (reconnectAttempts > 0 && !isOfflineMode) {
              isOfflineMode = true;
              toast.error('通知サーバーへの接続が失われました。自動的に再接続を試みています...', {
                id: 'websocket-disconnected',
                duration: 5000,
              });
            }

            // 再接続を試みる
            attemptReconnect();
          };
        }
      } catch (error) {
        console.error('[WebSocket] 接続エラー:', error);
        // エラー発生時も再接続を試みる
        attemptReconnect();
      }
    };

    // 再接続を試みる関数
    const attemptReconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(
          `[WebSocket] 再接続を試みます (${reconnectAttempts}/${maxReconnectAttempts})...`
        );

        // 前回のタイマーをクリア
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        // 指数バックオフ（再試行間隔を徐々に長くする）
        const delay = reconnectDelay * Math.pow(1.5, reconnectAttempts - 1);
        reconnectTimer = setTimeout(connectWebSocket, delay);
      } else {
        console.error('[WebSocket] 最大再接続試行回数に達しました。手動での更新が必要です。');

        // 全ての再接続が失敗した場合のみユーザーに通知
        if (!isOfflineMode) {
          isOfflineMode = true;
          toast.error('通知システムに接続できません。ページを更新してください。', {
            duration: 10000,
            id: 'websocket-max-retry',
          });
        }

        // オフラインモードを有効化
        handleOfflineMode();
      }
    };

    // オフラインモード処理
    const handleOfflineMode = () => {
      // ポーリングによる定期的な通知取得（WebSocketのフォールバック）
      console.log('[WebSocket] オフラインモードで動作します。ポーリングを開始します。');

      // すでに5分ごとのポーリングがsetIntervalで設定されているため、
      // ここでは特別な処理は不要だが、必要に応じて頻度を上げることも可能
    };

    // ユーザーが認証済みの場合のみWebSocket接続を開始
    if (isAuthenticated && user) {
      connectWebSocket();
    }

    // 定期的に通知を更新（WebSocketのフォールバックとして）
    const intervalId = setInterval(() => {
      fetchNotifications().catch(handleApiError);
    }, 300000); // 5分ごとに更新

    // クリーンアップ関数
    return () => {
      clearInterval(intervalId);

      // 再接続タイマーをクリア
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      // WebSocket接続を閉じる
      if (ws !== null) {
        console.log('[WebSocket] 接続をクローズします');
        ws.close();
      }
    };
  }, [isAuthenticated, user, fetchNotifications, navigate, setIsAuthenticated, handleApiError]);

  // 通知タイプに応じたアイコンを取得する関数
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock size={16} className="text-amber-500" />;
      case 'report':
        return <BarChart2 size={16} className="text-blue-500" />;
      case 'alert':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // 通知を既読にする処理
  const handleNotificationRead = async (notificationId: number) => {
    try {
      // 通知を既読にするAPIを呼び出し
      await notificationApi.markNotificationAsRead(notificationId);

      // ローカルの状態を更新
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // 未読通知数を減らす
      setUnreadNotifications((prev) => Math.max(0, prev - 1));

      toast.success('通知を既読にしました', { id: `read-${notificationId}` });
    } catch (error) {
      console.error('通知既読エラー:', error);
      toast.error('通知の既読処理に失敗しました');
    }
  };

  // すべての通知を既読にする処理
  const handleAllNotificationsRead = async () => {
    try {
      if (!user) return;

      // すべての通知を既読にするAPIを呼び出し
      await notificationApi.markAllNotificationsAsRead(user.id);

      // ローカルの状態を更新
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // 未読通知数をゼロにする
      setUnreadNotifications(0);

      toast.success('すべての通知を既読にしました');
    } catch (error) {
      console.error('全通知既読エラー:', error);
      toast.error('通知の一括既読処理に失敗しました');
    }
  };

  // 通知を削除する処理
  const handleNotificationDelete = async (notificationId: number) => {
    try {
      // 通知を削除するAPIを呼び出し
      await notificationApi.deleteNotification(notificationId);

      // 通知リストから削除された通知を除外
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // 未読通知だった場合は未読カウントを減らす
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      }

      toast.success('通知を削除しました');
    } catch (error) {
      console.error('通知削除エラー:', error);
      toast.error('通知の削除に失敗しました');
    }
  };

  // 通知の全削除処理
  const handleDeleteAllNotifications = async () => {
    try {
      if (!user) return;

      // 確認ダイアログを表示
      if (!window.confirm('すべての通知を削除してもよろしいですか？')) {
        return;
      }

      // すべての通知を削除するAPIを呼び出し
      await notificationApi.deleteAllNotifications(user.id);

      // ローカルの状態を更新
      setNotifications([]);
      setUnreadNotifications(0);

      toast.success('すべての通知を削除しました');

      // 通知パネルを閉じる
      setIsNotificationOpen(false);
    } catch (error) {
      console.error('全通知削除エラー:', error);
      toast.error('通知の一括削除に失敗しました');
    }
  };

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
    toast.success(`言語を${value === 'ja-JP' ? '日本語' : 'English'}に変更しました`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      toast.success('ログアウトしました');
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  // メニュー項目の定義
  const frequentMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: <Clock size={18} />,
        label: '作業時間入力',
        path: '/work-time',
        description: '作業時間を記録します',
      },
      {
        icon: <BarChart2 size={18} />,
        label: '作業時間レポート',
        path: '/work-time-reports',
        description: '作業時間の分析レポートを表示します',
      },
      {
        icon: <BarChart2 size={18} />,
        label: '資産/負債',
        path: '/asset-liability-report',
        isPremium: false,
        description: '資産と負債の状況を管理します',
      },
      {
        icon: <Calendar size={18} />,
        label: '資産カレンダー',
        path: '/asset-calendar',
        isPremium: false,
        description: '資産の増減をカレンダーで管理します',
      },
      {
        icon: <CreditCard size={18} />,
        label: 'サブスク管理',
        path: '/subscription-management',
        description: 'サブスクリプション設定を管理します',
      },
      {
        icon: <Moon size={18} />,
        label: '睡眠',
        path: '/sleep-tracker',
        isPremium: false,
        description: '睡眠の質を記録・分析します',
      },
      {
        icon: <BookOpen size={18} />,
        label: '本棚',
        path: '/bookshelf',
        description: '読んだ本を管理します',
      },
      {
        icon: <Guitar size={18} />,
        label: 'ギター練習',
        path: '/guitar-practice',
        isPremium: true,
        description: 'ギター練習の記録と進捗管理',
      },
      {
        icon: <Pen size={18} />,
        label: 'ブログ',
        path: '/blog',
        description: 'ブログを書いて共有します',
      },
      {
        icon: <BookOpen size={18} />,
        label: 'ADHD日記',
        path: '/diary',
        isPremium: true,
        description: 'ADHD症状の記録と管理',
      },
      {
        icon: <AlertCircle size={18} />,
        label: '衝動トラッカー',
        path: '/impulse-tracker',
        isPremium: true,
        description: '衝動的な行動を記録して改善します',
      },
    ],
    []
  );

  const otherMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: <Home size={18} />,
        label: 'ホーム',
        path: '/',
        description: 'ダッシュボードを表示します',
      },
      {
        icon: <Vote size={18} />,
        label: '選挙候補者',
        path: '/election-candidates',
        description: '選挙候補者の情報を表示します',
      },
      {
        icon: <User size={18} />,
        label: 'プロフィール',
        path: '/profile',
        description: 'ユーザープロフィールを編集します',
      },
      {
        icon: <GitBranch size={18} />,
        label: 'WBS作成ツール',
        path: '/wbs-creator',
        isPremium: true,
        description: 'Work Breakdown Structureを作成します',
      },
      {
        icon: <BarChart2 size={18} />,
        label: '政党支持率',
        path: '/political-trends',
        description: '政党支持率のトレンドを表示します',
      },
      {
        icon: <Calendar size={18} />,
        label: 'カレンダー',
        path: '/calendar',
        description: 'イベントカレンダーを表示します',
      },
      {
        icon: <HelpCircle size={18} />,
        label: 'ヘルプ',
        path: '/help',
        description: '使い方ガイドとよくある質問',
      },
    ],
    []
  );

  // 現在のパスがアクティブかどうかをチェック
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // メニュー項目のレンダリング（プレミアム対応）- 更新版
  const renderMenuItem = (item: MenuItem, mobile: boolean = false) => {
    const isItemActive = isActive(item.path);
    const isPremiumItem = item.isPremium && !isSubscriptionChecking;
    const needsUpgrade = isPremiumItem && !isPremium;

    const linkClasses = cn(
      'group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
      mobile ? 'text-base' : 'text-sm',
      isItemActive
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 hover:shadow-md',
      needsUpgrade && 'opacity-60'
    );

    const content = (
      <>
        <span
          className={cn(
            'transition-transform duration-200',
            !isItemActive && 'group-hover:scale-110'
          )}
        >
          {item.icon}
        </span>
        <span className="ml-3">{item.label}</span>
        {isPremiumItem && <Crown size={14} className="ml-2 text-amber-500 animate-pulse" />}
        {item.badge && (
          <Badge
            variant="secondary"
            className="ml-auto bg-gradient-to-r from-pink-500 to-violet-500 text-white border-0"
          >
            {item.badge}
          </Badge>
        )}
        {!isItemActive && (
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  toast.error('この機能はプレミアムプラン限定です');
                  navigate('/subscription-management');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    作業時間
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    トラッカー
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg opacity-20 blur group-hover:opacity-30 transition-opacity duration-300" />
                </div>
                {isPremium && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white border-0 shadow-lg shadow-amber-500/30 animate-shimmer"
                  >
                    <Sparkles size={12} className="mr-1" />
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
                aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-3">
              {/* 通知ボタン */}
              {isAuthenticated && (
                <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative group hover:bg-gray-100/80"
                    >
                      <Bell size={20} className="transition-transform group-hover:rotate-12" />
                      {unreadNotifications > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 animate-pulse"
                          variant="destructive"
                        >
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-md bg-white/95 backdrop-blur-xl"
                  >
                    <SheetHeader className="border-b pb-4 mb-4">
                      <SheetTitle className="text-left flex justify-between items-center">
                        <span className="flex items-center">
                          <Bell className="mr-2 h-5 w-5" />
                          通知
                          {unreadNotifications > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadNotifications}
                            </Badge>
                          )}
                        </span>
                        <div className="flex items-center space-x-2">
                          {notifications.length > 0 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAllNotificationsRead}
                                disabled={unreadNotifications === 0 || isLoadingNotifications}
                              >
                                すべて既読
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteAllNotifications}
                                disabled={notifications.length === 0 || isLoadingNotifications}
                              >
                                すべて削除
                              </Button>
                            </>
                          )}
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                      {isLoadingNotifications ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p className="text-gray-500">通知を読み込み中...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="bg-gray-100 rounded-full p-3 mb-4">
                            <Bell className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">通知はありません</h3>
                          <p className="text-sm text-gray-500 text-center max-w-xs">
                            新しい通知が届くとここに表示されます。
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* 通知フィルターや検索 */}
                          <div className="flex items-center justify-between mb-2">
                            <Select defaultValue="all">
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="すべての通知" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">すべての通知</SelectItem>
                                <SelectItem value="unread">未読のみ</SelectItem>
                                <SelectItem value="reminder">リマインダー</SelectItem>
                                <SelectItem value="report">レポート</SelectItem>
                                <SelectItem value="alert">アラート</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                // 通知を再取得
                                fetchNotifications();
                              }}
                            >
                              <RefreshCw size={14} className="mr-1" />
                              更新
                            </Button>
                          </div>

                          {/* 通知リスト */}
                          {notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={handleNotificationRead}
                              onDelete={handleNotificationDelete}
                            />
                          ))}

                          {/* 通知設定へのリンク */}
                          <div className="border-t pt-4 mt-6 text-center">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setIsNotificationOpen(false);
                                navigate('/settings/notifications');
                              }}
                            >
                              <Settings size={14} className="mr-1" />
                              通知設定を管理
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* 言語切替ボタン */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-gray-100/80">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium">
                      {locale === 'ja-JP' ? '日本語' : 'English'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-gray-200/50">
                  <DropdownMenuItem
                    onClick={() => handleLocaleChange('ja-JP')}
                    className="hover:bg-gray-100/80"
                  >
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLocaleChange('en-US')}
                    className="hover:bg-gray-100/80"
                  >
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
                      className="flex items-center space-x-2 hover:bg-gray-100/80 pr-4"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                        <AvatarImage src="/default-avatar.png" alt={user?.name || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user?.name || '読み込み中...'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white/95 backdrop-blur-xl border-gray-200/50 w-56"
                  >
                    <DropdownMenuLabel className="font-semibold">アカウント</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="hover:bg-gray-100/80"
                    >
                      <User className="mr-2 h-4 w-4 text-indigo-600" />
                      <span>プロフィール</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/subscription-management')}
                      className="hover:bg-gray-100/80"
                    >
                      <CreditCard className="mr-2 h-4 w-4 text-purple-600" />
                      <span>サブスクリプション</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/settings')}
                      className="hover:bg-gray-100/80"
                    >
                      <Settings className="mr-2 h-4 w-4 text-gray-600" />
                      <span>設定</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200/50" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
                >
                  <LogIn size={18} className="mr-2" />
                  <span>ログイン</span>
                </Button>
              )}
            </nav>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex justify-between items-center overflow-x-auto mt-3">
            <nav className="flex space-x-2 py-1">
              {frequentMenuItems.slice(0, 7).map((item) => renderMenuItem(item))}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-200/50 hover:bg-gray-100/80 hover:border-gray-300/50"
                >
                  その他のメニュー
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 backdrop-blur-xl border-gray-200/50 w-64"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>よく使う機能</DropdownMenuLabel>
                  {frequentMenuItems.slice(7).map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      disabled={item.isPremium && !isPremium}
                      onClick={() => {
                        if (item.isPremium && !isPremium) {
                          toast.error('この機能はプレミアムプラン限定です');
                          navigate('/subscription-management');
                          return;
                        }
                        navigate(item.path);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.isPremium && <Crown size={14} className="ml-1 text-amber-500" />}
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
                          toast.error('この機能はプレミアムプラン限定です');
                          navigate('/subscription-management');
                          return;
                        }
                        navigate(item.path);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.isPremium && <Crown size={14} className="ml-1 text-amber-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated && (
                <div className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/default-avatar.png" alt={user?.name || ''} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{user?.name || '読み込み中...'}</p>
                      <p className="text-xs text-gray-500">{user?.email || ''}</p>
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
                          <span className="flex items-center">
                            <Bell className="mr-2 h-5 w-5" />
                            通知
                            {unreadNotifications > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {unreadNotifications}
                              </Badge>
                            )}
                          </span>
                          <div className="flex items-center space-x-2">
                            {notifications.length > 0 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleAllNotificationsRead}
                                  disabled={unreadNotifications === 0 || isLoadingNotifications}
                                >
                                  すべて既読
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDeleteAllNotifications}
                                  disabled={notifications.length === 0 || isLoadingNotifications}
                                >
                                  すべて削除
                                </Button>
                              </>
                            )}
                          </div>
                        </SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                        {isLoadingNotifications ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-gray-500">通知を読み込み中...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="bg-gray-100 rounded-full p-3 mb-4">
                              <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">通知はありません</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs">
                              新しい通知が届くとここに表示されます。
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* 通知フィルターや検索 */}
                            <div className="flex items-center justify-between mb-2">
                              <Select defaultValue="all">
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                  <SelectValue placeholder="すべての通知" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">すべての通知</SelectItem>
                                  <SelectItem value="unread">未読のみ</SelectItem>
                                  <SelectItem value="reminder">リマインダー</SelectItem>
                                  <SelectItem value="report">レポート</SelectItem>
                                  <SelectItem value="alert">アラート</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  // 通知を再取得
                                  fetchNotifications();
                                }}
                              >
                                <RefreshCw size={14} className="mr-1" />
                                更新
                              </Button>
                            </div>

                            {/* 通知リスト */}
                            {notifications.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleNotificationRead}
                                onDelete={handleNotificationDelete}
                              />
                            ))}

                            {/* 通知設定へのリンク */}
                            <div className="border-t pt-4 mt-6 text-center">
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  navigate('/settings/notifications');
                                }}
                              >
                                <Settings size={14} className="mr-1" />
                                通知設定を管理
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              <div className="font-medium px-3 pt-3 pb-1">よく使う機能</div>
              {frequentMenuItems.map((item) => renderMenuItem(item, true))}

              <div className="font-medium px-3 pt-3 pb-1 mt-4">その他の機能</div>
              {otherMenuItems.map((item) => renderMenuItem(item, true))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    {locale === 'ja-JP' ? '日本語' : 'English'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLocaleChange('ja-JP')}>
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLocaleChange('en-US')}>
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/profile')}
                    className="w-full justify-start flex items-center px-3 py-2"
                  >
                    <User size={18} />
                    <span className="ml-2">プロフィール設定</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/subscription-management')}
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
                  onClick={() => navigate('/login')}
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
          location.pathname !== '/login' &&
          location.pathname !== '/register' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 p-5 mb-6 rounded-2xl shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="bg-blue-500 rounded-full p-2">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-900 font-medium">
                    より多くの機能を利用するには
                    <Link
                      to="/login"
                      className="font-semibold underline text-blue-700 hover:text-blue-800 mx-1 transition-colors"
                    >
                      ログイン
                    </Link>
                    または
                    <Link
                      to="/register"
                      className="font-semibold underline text-blue-700 hover:text-blue-800 mx-1 transition-colors"
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
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200/50 p-5 mb-6 rounded-2xl shadow-sm hidden md:block">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-2 shadow-lg shadow-amber-500/30">
                    <Crown className="h-5 w-5 text-white animate-pulse" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-amber-900 font-semibold mb-1">
                    プレミアムプランで無限の可能性を
                  </h3>
                  <p className="text-sm text-amber-700">
                    すべての機能をアンロックして、生産性を最大化しましょう。
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/30 transition-all duration-200"
                onClick={() => navigate('/subscription-management')}
              >
                <Zap size={16} className="mr-2" />
                アップグレード
              </Button>
            </div>
          </div>
        )}

        {children}
      </main>

      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-600 border-t border-gray-200/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                作業時間トラッカー
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                あなたの生産性向上をサポートする最高のツールです。作業時間の記録、分析、改善を一つのアプリで実現しましょう。
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1.5">
                  <Shield size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">安全で信頼性の高いサービス</span>
              </div>
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
                  <Link to="/subscription-management" className="hover:underline">
                    サブスクリプション
                  </Link>
                </li>
                <li>
                  <Link to="/asset-liability-report" className="hover:underline">
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

          <div className="mt-12 pt-8 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} 作業時間トラッカー. All rights reserved.
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">継続的に成長中のプラットフォーム</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
