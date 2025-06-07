import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchBlogPost,
  selectBlogPostById,
  selectBlogPosts,
  deleteBlogPost,
} from '@/store/blogSlice';
import { useAuth } from '@/context/useAuth';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { ArrowBack, Share, Edit, Delete, MoreVert } from '@mui/icons-material';
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

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  // Redux storeからデータを取得
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const allPosts = useSelector(selectBlogPosts);

  // 状態管理
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 関連記事を取得（同じカテゴリの他の記事）
  const relatedPosts = allPosts
    .filter((p) => p._id !== id && p.category === post?.category)
    .slice(0, 3);

  // 投稿の権限チェック（作成者または管理者のみ編集・削除可能）
  const canModifyPost =
    post && user && (post.author === user.email || post.author === user.name || user.isAdmin);

  useEffect(() => {
    if (id && !post) {
      // 投稿がstoreにない場合は個別に取得
      dispatch(fetchBlogPost(id));
    }
  }, [id, post, dispatch]);

  const handleShare = async () => {
    if (!post) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } else {
        // フォールバック: URLをクリップボードにコピー
        await navigator.clipboard.writeText(window.location.href);
        toast.success('URLをクリップボードにコピーしました');
      }
    } catch (error) {
      console.error('共有に失敗しました:', error);
      toast.error('共有に失敗しました');
    }
  };

  const handleEdit = () => {
    if (post) {
      navigate(`/blog/edit/${post._id}`);
    }
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!post || !id) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteBlogPost(id)).unwrap();
      toast.success('ブログ記事を削除しました');
      navigate('/blog');
    } catch (error) {
      console.error('削除に失敗しました:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!id) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">無効なブログIDです</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/blog')} sx={{ mt: 2 }}>
            ブログ一覧に戻る
          </Button>
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">記事を読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/blog')}
              variant="outlined"
              size="small"
            >
              戻る
            </Button>
            <Button startIcon={<Share />} onClick={handleShare} variant="outlined" size="small">
              共有
            </Button>
          </Box>

          {/* 編集・削除メニュー */}
          {canModifyPost && (
            <Box>
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVert />
              </IconButton>
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
                <MenuItem onClick={handleEdit}>
                  <Edit sx={{ mr: 1, fontSize: '1rem' }} />
                  編集
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                  <Delete sx={{ mr: 1, fontSize: '1rem' }} />
                  削除
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            {post.author}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(post.createdAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            更新: {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
          </Typography>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={post.category} color="primary" size="small" />
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Markdownコンテンツのレンダリング */}
        <Box sx={{ mb: 4 }}>
          <MarkdownRenderer content={post.content} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* いいね・コメント機能（将来的に実装） */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            いいね: {post.likes?.length || 0}件
          </Typography>
          <Typography variant="body2" color="text.secondary">
            コメント: {post.comments?.length || 0}件
          </Typography>
        </Box>

        {relatedPosts.length > 0 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              関連記事
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
                gap: 2,
              }}
            >
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost._id} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {relatedPost.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {relatedPost.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      <Chip label={relatedPost.category} color="primary" size="small" />
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/blog/${relatedPost._id}`)}
                      variant="outlined"
                    >
                      続きを読む
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
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
              <strong>「{post.title}」</strong>を削除しますか？
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

export default BlogPostDetail;
