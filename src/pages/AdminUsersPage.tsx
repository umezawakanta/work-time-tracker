import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Users } from 'lucide-react';
import { listUsers, updateUser } from '@/services/api/adminUsersApi';
import AdminUserSubscriptionPanel from '@/components/admin/AdminUserSubscriptionPanel';
import type { PublicUser } from '@/types/admin';
import { toast } from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<PublicUser[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [confirm, setConfirm] = useState<{
    type: 'promote' | 'demote' | 'block' | 'unblock' | 'delete';
    user: PublicUser;
  } | null>(null);
  const [subPanelUser, setSubPanelUser] = useState<PublicUser | null>(null);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  // 全角→半角正規化関数
  const zenkaku2hankaku = (s: string): string => {
    return s.replace(/[Ａ-Ｚａ-ｚ０-９＠．－＿]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
  };

  // 安全ガード: 配列でない場合は空配列に正規化
  const safeItems = Array.isArray(items) ? items : [];

  // クライアントサイド検索フィルタリング（全角→半角正規化対応）
  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return safeItems;

    const normalizedQuery = zenkaku2hankaku(debouncedQuery.trim().toLowerCase());

    return safeItems.filter((user) => {
      const normalizedName = zenkaku2hankaku((user.name || '').toLowerCase());
      const normalizedEmail = zenkaku2hankaku((user.email || '').toLowerCase());

      return normalizedName.includes(normalizedQuery) || normalizedEmail.includes(normalizedQuery);
    });
  }, [safeItems, debouncedQuery, zenkaku2hankaku]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listUsers({ q: debouncedQuery, page, limit, sort: '-createdAt' });
      setItems(res.data);
      setTotal(res.total);
    } catch (e) {
      setError('ユーザー一覧の取得に失敗しました');
      toast.error('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    void fetchPage();
  }, [page, debouncedQuery]);

  useEffect(() => {
    // 検索語が変わったら1ページ目へ
    setPage(1);
  }, [debouncedQuery]);

  const formatStatus = (u: PublicUser): string => {
    if (u.blocked) return 'ブロック済み';
    return u.isActive ? '有効' : '招待中';
  };

  const handlePromoteDemote = async (u: PublicUser) => {
    try {
      const toAdmin = u.role !== 'admin';
      await updateUser(u._id, toAdmin ? { role: 'admin', roles: ['admin'] } : { role: 'user' });
      toast.success(toAdmin ? '管理者に昇格しました' : '一般ユーザーに変更しました');
      void fetchPage();
    } catch {
      toast.error('更新に失敗しました');
    }
  };

  const handleToggleBlock = async (u: PublicUser) => {
    try {
      const nextBlocked = !u.blocked;
      await updateUser(u._id, nextBlocked ? { blocked: true } : { isActive: true, blocked: false });
      toast.success(nextBlocked ? 'ユーザーをブロックしました' : 'ブロックを解除しました');
      void fetchPage();
    } catch {
      toast.error('更新に失敗しました');
    }
  };

  return (
    <div className="px-4 pb-28 max-w-screen-md mx-auto">
      {/* ヘッダー - モバイル最適化 */}
      <header className="pt-3 pb-2">
        <h2 className="text-base sm:text-lg font-bold text-center text-gray-800 flex items-center justify-center">
          <Users className="w-5 h-5 mr-2" /> ユーザー管理
        </h2>
        <p className="text-sm text-gray-600 text-center mt-1">
          登録ユーザーの一覧・検索・更新を行えます。
        </p>
      </header>

      {/* 検索フォーム - モバイル最適化 */}
      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="メール/名前で検索"
          aria-label="ユーザー検索"
          className="w-full md:flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => void fetchPage()}
          disabled={loading}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm active:opacity-90 disabled:opacity-60 min-h-[40px]"
        >
          {loading ? '読み込み中…' : '再読み込み'}
        </button>
      </div>

      {error && (
        <Alert role="alert" aria-live="assertive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラーが発生しました</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* モバイル用カード表示 */}
      <section className="mt-4 md:hidden space-y-3">
        {loading && safeItems.length === 0 ? (
          <SkeletonList count={3} />
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
            ユーザーが見つかりません
          </div>
        ) : (
          filteredItems.map((u) => (
            <UserCard
              key={u._id || u.email}
              user={u}
              onEdit={() => setSubPanelUser(u)}
              onDelete={() => setConfirm({ type: 'delete', user: u })}
              onPromote={() =>
                setConfirm({ type: u.role === 'admin' ? 'demote' : 'promote', user: u })
              }
              onBlock={() => setConfirm({ type: u.blocked ? 'unblock' : 'block', user: u })}
              formatStatus={formatStatus}
            />
          ))
        )}
      </section>

      {/* デスクトップ用テーブル表示 */}
      <section className="mt-4 hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <Th>名前</Th>
                <Th>メール</Th>
                <Th>ロール</Th>
                <Th>ステータス</Th>
                <Th className="text-right pr-4">操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && safeItems.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-3 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </td>
                    <td className="px-3 py-4">
                      <div className="h-4 bg-gray-200 rounded w-40" />
                    </td>
                    <td className="px-3 py-4">
                      <div className="h-5 bg-gray-200 rounded-full w-12" />
                    </td>
                    <td className="px-3 py-4">
                      <div className="h-5 bg-gray-200 rounded-full w-16" />
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="h-6 bg-gray-200 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    ユーザーが見つかりません
                  </td>
                </tr>
              ) : (
                filteredItems.map((u) => (
                  <tr key={u._id || u.email} className="hover:bg-gray-50">
                    <Td className="font-medium">{u.name || '—'}</Td>
                    <Td>
                      <span className="break-all line-clamp-1 inline-block max-w-[280px]">
                        {u.email}
                      </span>
                    </Td>
                    <Td>
                      <RoleBadge role={u.role} />
                    </Td>
                    <Td>
                      <StatusBadge status={formatStatus(u)} />
                    </Td>
                    <Td className="text-right pr-3">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setSubPanelUser(u)}
                          className="px-3 py-1 rounded-md border text-[13px] hover:bg-gray-50 min-h-[40px]"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => setConfirm({ type: 'delete', user: u })}
                          className="px-3 py-1 rounded-md bg-rose-600 text-white text-[13px] hover:opacity-90 min-h-[40px]"
                        >
                          削除
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent
          role="alertdialog"
          aria-modal="true"
          aria-describedby="admin-user-confirm-desc"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {confirm?.type === 'promote' && '管理者に昇格？'}
              {confirm?.type === 'demote' && '一般ユーザーに変更？'}
              {confirm?.type === 'block' && 'ユーザーをブロック？'}
              {confirm?.type === 'unblock' && 'ブロック解除？'}
              {confirm?.type === 'delete' && 'ユーザーを削除？'}
            </AlertDialogTitle>
            <AlertDialogDescription id="admin-user-confirm-desc" className="text-sm">
              {confirm?.user.email}
              {confirm?.type === 'delete' && '（取り消し不可）'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              aria-label="実行"
              className="min-h-[40px]"
              onClick={async () => {
                const c = confirm;
                setConfirm(null);
                if (!c) return;
                if (c.type === 'promote' || c.type === 'demote') {
                  await handlePromoteDemote(c.user);
                } else if (c.type === 'block' || c.type === 'unblock') {
                  await handleToggleBlock(c.user);
                } else {
                  try {
                    const { deleteUser } = await import('@/services/api/adminUsersApi');
                    await deleteUser(c.user._id);
                    toast.success('ユーザーを削除しました');
                    void fetchPage();
                  } catch {
                    toast.error('削除に失敗しました');
                  }
                }
              }}
            >
              {confirm?.type === 'delete' ? '削除' : '実行'}
            </AlertDialogAction>
            <AlertDialogCancel aria-label="キャンセル" className="min-h-[40px]">
              キャンセル
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ページネーション */}
      <Pagination
        className="mt-5"
        page={page}
        pageCount={totalPages}
        onChange={(p) => setPage(p)}
        loading={loading}
      />

      {subPanelUser && (
        <AdminUserSubscriptionPanel
          user={subPanelUser}
          open={!!subPanelUser}
          onOpenChange={(o) => !o && setSubPanelUser(null)}
        />
      )}
    </div>
  );
};

// サブコンポーネント
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-sm border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="shrink-0 space-y-1">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-12" />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <div className="h-6 bg-gray-200 rounded w-12" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );
}

function Th({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
}

function Td({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-3 py-2 align-top text-gray-800 ${className}`}>{children}</td>;
}

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, string> = {
    admin: '管理者',
    manager: 'マネージャー',
    user: '一般',
  };
  const label = map[role ?? ''] || role || '—';
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-[2px] text-xs">
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? '').toLowerCase();
  const styles =
    s === 'active' || s === '有効'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : s === 'invited' || s === '招待中'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : s === 'suspended' || s === '停止中' || s === 'ブロック済み'
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-gray-50 text-gray-700 border-gray-200';
  const label =
    s === 'active' || s === '有効'
      ? '有効'
      : s === 'invited' || s === '招待中'
        ? '招待中'
        : s === 'suspended' || s === '停止中' || s === 'ブロック済み'
          ? '停止中'
          : '—';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-[2px] text-xs ${styles}`}
    >
      {label}
    </span>
  );
}

function UserCard({
  user,
  onEdit,
  onDelete,
  onPromote,
  onBlock,
  formatStatus,
}: {
  user: PublicUser;
  onEdit?: () => void;
  onDelete?: () => void;
  onPromote?: () => void;
  onBlock?: () => void;
  formatStatus: (user: PublicUser) => string;
}) {
  return (
    <div
      onClick={onEdit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 cursor-pointer active:opacity-80 select-none hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[15px] leading-5 truncate">
            {user.name || '（名称未設定）'}
          </p>
          <p className="text-xs text-gray-500 break-all line-clamp-1">{user.email}</p>
        </div>
        <div className="shrink-0 text-right space-y-1">
          <RoleBadge role={user.role} />
          <div>
            <StatusBadge status={formatStatus(user)} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs active:opacity-90 min-h-[40px]"
        >
          削除
        </button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
  loading,
  className = '',
}: {
  page: number;
  pageCount: number;
  onChange?: (p: number) => void;
  loading?: boolean;
  className?: string;
}) {
  const prev = () => onChange?.(Math.max(1, page - 1));
  const next = () => onChange?.(Math.min(pageCount, page + 1));
  return (
    <div className={`flex flex-col items-center gap-2 md:flex-row md:justify-between ${className}`}>
      <span className="text-xs text-gray-500">
        ページ {page} / {pageCount}
      </span>
      <div className="inline-flex gap-2">
        <button
          onClick={prev}
          disabled={page <= 1 || loading}
          className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50 min-h-[40px]"
        >
          前へ
        </button>
        <button
          onClick={next}
          disabled={page >= pageCount || loading}
          className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50 min-h-[40px]"
        >
          次へ
        </button>
      </div>
    </div>
  );
}

export default AdminUsersPage;
