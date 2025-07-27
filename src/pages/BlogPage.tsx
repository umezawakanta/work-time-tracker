import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchBlogPosts,
  selectBlogPosts,
  selectBlogStatus,
  selectBlogError,
  deleteBlogPost,
} from '@/store/blogSlice';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
// Icons from lucide-react
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Hash,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const error = useSelector(selectBlogError);
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState(0);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Redux storeからブログポストを取得
    if (status === 'idle') {
      console.log('🔄 ブログポストを取得中...');
      dispatch(fetchBlogPosts())
        .unwrap()
        .then((data) => {
          console.log('✅ ブログポスト取得成功:', data.length, 'posts');
        })
        .catch((error) => {
          console.error('❌ ブログポスト取得エラー:', error);
          toast.error('ブログポストの取得に失敗しました');
        });
    }
  }, [dispatch, status]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredPosts = posts.filter((post) => {
    // タブによるフィルタリング
    if (user && selectedTab === 4) {
      // 自分の投稿タブ
      const isMyPost = post.author === user.email || post.author === user.name;
      if (!isMyPost) return false;
    }

    const matchesCategory =
      category === 'all' || post.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 投稿の権限チェック（管理者は全て削除可能）
  const canModifyPost = (postAuthor: string) => {
    if (!user) return false;

    // 管理者は全ての投稿を編集・削除可能
    if (user.isAdmin) return true;

    // 作成者は自分の投稿のみ編集・削除可能
    return postAuthor === user.email || postAuthor === user.name;
  };

  // 管理者権限の確認
  const isAdmin = user?.isAdmin === true;

  // 管理者向け統計情報
  const getAdminStats = () => {
    if (!isAdmin) return null;

    const totalPosts = posts.length;
    const myPosts = posts.filter((p) => p.author === user?.email || p.author === user?.name).length;
    const othersPosts = totalPosts - myPosts;

    return { totalPosts, myPosts, othersPosts };
  };

  const adminStats = getAdminStats();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleEdit = () => {
    if (selectedPostId) {
      window.location.href = `/blog/edit/${selectedPostId}`;
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedPostId) {
      const post = posts.find((p) => p._id === selectedPostId);
      if (post) {
        setPostToDelete(selectedPostId);
        setShowDeleteDialog(true);
      }
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    const post = posts.find((p) => p._id === postToDelete);
    const isMyPost = post && user && (post.author === user.email || post.author === user.name);
    const isAdminDelete = isAdmin && !isMyPost;

    setIsDeleting(true);
    try {
      await dispatch(deleteBlogPost(postToDelete)).unwrap();

      if (isAdminDelete) {
        toast.success('管理者権限でブログ記事を削除しました');
      } else {
        toast.success('ブログ記事を削除しました');
      }
    } catch (error) {
      console.error('削除に失敗しました:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const getPostToDeleteTitle = () => {
    if (!postToDelete) return '';
    const post = posts.find((p) => p._id === postToDelete);
    return post?.title || '';
  };

  const getPostToDeleteAuthor = () => {
    if (!postToDelete) return '';
    const post = posts.find((p) => p._id === postToDelete);
    return post?.author || '';
  };

  const isMyPost = (postAuthor: string) => {
    return user && (postAuthor === user.email || postAuthor === user.name);
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>ブログポストを読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  if (status === 'failed') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">データの取得に失敗しました</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error || 'ブログポストを取得できませんでした。'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={async () => {
                  console.log('🔄 ブログポストを再取得...');
                  setIsRetrying(true);
                  try {
                    await dispatch(fetchBlogPosts()).unwrap();
                    toast.success('ブログポストを再取得しました');
                  } catch (error) {
                    console.error('❌ 再取得エラー:', error);
                    toast.error('再取得に失敗しました');
                  } finally {
                    setIsRetrying(false);
                  }
                }}
                disabled={isRetrying}
                startIcon={isRetrying ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                {isRetrying ? '再取得中...' : '再試行'}
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={() => window.location.reload()}>
                ページを再読み込み
              </Button>
            </Box>
          </Alert>
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>開発者向け情報:</strong>
                <br /> • API Base URL:{' '}
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}
                <br />• エラー詳細: {error}
                <br />• ブラウザの開発者ツールでネットワークタブを確認してください
              </Typography>
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* 管理者権限の表示 */}
        {isAdmin && (
          <Alert severity="info" icon={<AdminPanelSettings />} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>管理者モード:</strong> 全ての投稿を編集・削除できます
              </Typography>
              {adminStats && (
                <Typography variant="caption" color="text.secondary">
                  自分: {adminStats.myPosts}件 | 他ユーザー: {adminStats.othersPosts}件 | 合計:{' '}
                  {adminStats.totalPosts}件
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              ブログ
              {isAdmin && (
                <Badge color="secondary" variant="dot" sx={{ ml: 1 }}>
                  <AdminPanelSettings color="primary" fontSize="small" />
                </Badge>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user && selectedTab === 4
                ? `自分の投稿: ${
                    posts.filter((p) => p.author === user.email || p.author === user.name).length
                  }件 / 全体: ${posts.length}件`
                : `全${posts.length}件の記事`}
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/blog/new"
            variant="contained"
            startIcon={<Add />}
            sx={{
              height: 'fit-content',
              fontWeight: 'bold',
            }}
          >
            新規投稿
          </Button>
        </Box>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="すべて" />
          <Tab label="技術" />
          <Tab label="プロダクト" />
          <Tab label="チーム" />
          {user && <Tab label="自分の投稿" />}
        </Tabs>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select value={category} label="カテゴリ" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="技術">技術</MenuItem>
              <MenuItem value="テクノロジー">テクノロジー</MenuItem>
              <MenuItem value="ビジネス">ビジネス</MenuItem>
              <MenuItem value="ライフスタイル">ライフスタイル</MenuItem>
              <MenuItem value="教育">教育</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {filteredPosts.map((post) => (
            <Card
              key={post._id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isAdmin && !isMyPost(post.author) ? '2px solid' : '1px solid',
                borderColor: isAdmin && !isMyPost(post.author) ? 'warning.main' : 'divider',
                backgroundColor:
                  isAdmin && !isMyPost(post.author) ? 'warning.50' : 'background.paper',
              }}
            >
              {/* 管理者表示・アクションメニュー */}
              {canModifyPost(post.author) && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  {isAdmin && !isMyPost(post.author) && (
                    <Chip label="管理者操作" color="warning" size="small" sx={{ mr: 1 }} />
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, post._id)}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ pr: 4 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content.substring(0, 150)}...
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  <Chip label={post.category} color="primary" size="small" />
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {post.author} • {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                  {isAdmin && !isMyPost(post.author) && (
                    <Chip
                      label="他ユーザー投稿"
                      color="warning"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button component={Link} to={`/blog/${post._id}`} size="small" variant="outlined">
                  続きを読む
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {/* アクションメニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItemComponent onClick={handleEdit}>
            <Edit sx={{ mr: 1, fontSize: '1rem' }} />
            編集
          </MenuItemComponent>
          <MenuItemComponent onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: '1rem' }} />
            削除
            {selectedPostId &&
              isAdmin &&
              !isMyPost(posts.find((p) => p._id === selectedPostId)?.author || '') && (
                <Chip label="管理者権限" color="warning" size="small" sx={{ ml: 1 }} />
              )}
          </MenuItemComponent>
        </Menu>

        {filteredPosts.length === 0 && status === 'succeeded' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              記事が見つかりませんでした。
            </Typography>
            {posts.length === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  まだブログ記事が投稿されていません。
                </Typography>
                <Button
                  component={Link}
                  to="/blog/new"
                  variant="contained"
                  sx={{ mt: 2 }}
                  startIcon={<Add />}
                >
                  最初の記事を投稿する
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Delete className="h-5 w-5 text-red-600" />
              ブログ記事を削除
              {postToDelete && isAdmin && !isMyPost(getPostToDeleteAuthor()) && (
                <Chip label="管理者権限" color="warning" size="small" />
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>「{getPostToDeleteTitle()}」</strong>を削除しますか？
              <br />
              {postToDelete && isAdmin && !isMyPost(getPostToDeleteAuthor()) && (
                <>
                  <strong>作成者:</strong> {getPostToDeleteAuthor()}
                  <br />
                  <em>※ 管理者権限で他のユーザーの投稿を削除します</em>
                  <br />
                </>
              )}
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                  削除中...
                </>
              ) : (
                '削除する'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default BlogPage;
