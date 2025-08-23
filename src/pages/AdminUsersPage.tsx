import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery]);

  useEffect(() => {
    // 検索語が変わったら1ページ目へ
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="overflow-x-auto">
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
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      読み込み中…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr key={u._id}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handlePromoteDemote(u)}
                          aria-label={u.role === 'admin' ? '一般権限に変更' : '管理者に昇格'}
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </Button>
                        <Button
                          variant={u.blocked ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => void handleToggleBlock(u)}
                          aria-label={u.blocked ? 'ブロック解除' : 'ブロック'}
                        >
                          {u.blocked ? 'Unblock' : 'Block'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">
              {total > 0
                ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total}`
                : '0 / 0'}
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
