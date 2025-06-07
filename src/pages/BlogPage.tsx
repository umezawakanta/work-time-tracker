import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchBlogPosts,
  selectBlogPosts,
  selectBlogStatus,
  deleteBlogPost,
} from '@/store/blogSlice';
import { useAuth } from '@/context/useAuth';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import { Add, MoreVert, Edit, Delete } from '@mui/icons-material';
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
import { toast } from 'react-hot-toast';

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState(0);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    // Redux storeからブログポストを取得
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
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

  // 投稿の権限チェック
  const canModifyPost = (postAuthor: string) => {
    return user && (postAuthor === user.email || postAuthor === user.name || user.isAdmin);
  };

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

    setIsDeleting(true);
    try {
      await dispatch(deleteBlogPost(postToDelete)).unwrap();
      toast.success('ブログ記事を削除しました');
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

  if (status === 'loading') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              ブログ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user && selectedTab === 4
                ? `自分の投稿: ${posts.filter((p) => p.author === user.email || p.author === user.name).length}件 / 全体: ${posts.length}件`
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
              }}
            >
              {/* アクションメニュー */}
              {canModifyPost(post.author) && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
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
          </MenuItemComponent>
        </Menu>

        {filteredPosts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              記事が見つかりませんでした。
            </Typography>
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
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>「{getPostToDeleteTitle()}」</strong>を削除しますか？
              <br />
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
