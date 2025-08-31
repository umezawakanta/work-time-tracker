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

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

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
    const t = setTimeout(() => setDebouncedQuery(query), 300);
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
    if (u.blocked) return 'suspended';
    return u.isActive ? 'active' : 'inactive';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="w-6 h-6 mr-2" /> ユーザー管理
          </h1>
          <p className="text-gray-600">登録ユーザーの一覧・検索・更新を行えます。</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="メール/名前で検索"
            aria-label="ユーザー検索"
            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="outline"
            size="sm"
            aria-label="再読み込み"
            onClick={() => void fetchPage()}
            disabled={loading}
          >
            {loading ? '読み込み中…' : '再読み込み'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert role="alert" aria-live="assertive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラーが発生しました</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto" aria-live="polite">
            <span className="sr-only" role="status">
              {loading ? '読み込み中' : '読み込み完了'}
            </span>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && items.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-48" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-40" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      ユーザーがいません
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr key={u._id || u.email}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ' +
                            (u.blocked
                              ? 'bg-red-100 text-red-800'
                              : u.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800')
                          }
                        >
                          {formatStatus(u)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="アクションを開く"
                              aria-haspopup="menu"
                            >
                              アクション
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirm({
                                  type: u.role === 'admin' ? 'demote' : 'promote',
                                  user: u,
                                })
                              }
                              aria-label={u.role === 'admin' ? '一般権限に変更' : '管理者に昇格'}
                            >
                              {u.role === 'admin'
                                ? 'Demote (一般に変更)'
                                : 'Promote (管理者に昇格)'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirm({ type: u.blocked ? 'unblock' : 'block', user: u })
                              }
                              aria-label={u.blocked ? 'ブロック解除' : 'ブロック'}
                            >
                              {u.blocked ? 'Unblock (ブロック解除)' : 'Block (ブロック)'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setConfirm({ type: 'delete', user: u })}
                              aria-label="ユーザー削除"
                            >
                              Delete (削除)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
            <AlertDialogContent
              role="alertdialog"
              aria-modal="true"
              aria-describedby="admin-user-confirm-desc"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirm?.type === 'promote' && '管理者に昇格しますか？'}
                  {confirm?.type === 'demote' && '一般ユーザーに変更しますか？'}
                  {confirm?.type === 'block' && 'このユーザーをブロックしますか？'}
                  {confirm?.type === 'unblock' && 'このユーザーのブロックを解除しますか？'}
                  {confirm?.type === 'delete' &&
                    'このユーザーを削除しますか？（取り消しできません）'}
                </AlertDialogTitle>
                <AlertDialogDescription id="admin-user-confirm-desc">
                  対象: {confirm?.user.email}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel aria-label="キャンセル" autoFocus>
                  キャンセル
                </AlertDialogCancel>
                <AlertDialogAction
                  aria-label="実行"
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
                  実行
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">
              {total > 0
                ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total} （ページ ${page} / ${totalPages}）`
                : '0 / 0 （ページ 0 / 0）'}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                aria-label="前のページ"
              >
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                aria-label="次のページ"
              >
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
