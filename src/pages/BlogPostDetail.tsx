import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogPost, selectBlogPostById, selectBlogPosts } from '@/store/blogSlice';
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
} from '@mui/material';
import { ArrowBack, Share } from '@mui/icons-material';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux storeからデータを取得
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const allPosts = useSelector(selectBlogPosts);

  // 関連記事を取得（同じカテゴリの他の記事）
  const relatedPosts = allPosts
    .filter((p) => p._id !== id && p.category === post?.category)
    .slice(0, 3);

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
        alert('URLをクリップボードにコピーしました');
      }
    } catch (error) {
      console.error('共有に失敗しました:', error);
    }
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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
    </Container>
  );
};

export default BlogPostDetail;
